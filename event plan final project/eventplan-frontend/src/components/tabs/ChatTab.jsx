import React, { useEffect, useMemo, useRef, useState } from 'react'
import { chatApi, eventMembersApi, eventsApi, usersApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { ConfirmDialog, Field, Modal, Spinner } from '../ui'

const EMPTY_INBOX = { groups: [], directMessages: [], contacts: [] }
const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Conference', 'Concert', 'Festival', 'Seminar', 'Other']

function defaultGroupForm() {
  return {
    eventName: '',
    eventType: 'Other',
    eventDate: new Date().toISOString().slice(0, 10),
    venue: 'Chat Workspace',
    description: '',
    memberIds: [],
  }
}

function displayName(user) {
  if (!user) return 'Unknown user'
  if (user.name && user.name.trim()) return user.name.trim()
  return user.email || 'Unknown user'
}

function initials(text) {
  if (!text) return 'CH'
  const parts = text.trim().split(/\s+/).slice(0, 2)
  return parts.map(part => part[0]?.toUpperCase() || '').join('') || 'CH'
}

function normalizeMessages(items) {
  return Array.isArray(items) ? items : []
}

function toGroupConversation(group) {
  return {
    type: 'group',
    id: group.eventId,
    eventId: group.eventId,
    title: group.eventName || 'Untitled Event',
    subtitle: group.eventType || group.venue || 'Event group chat',
    preview: group.lastMessage,
    lastActivityAt: group.lastActivityAt,
    participantCount: group.participantCount || 0,
    raw: group,
  }
}

function toDirectConversation(item) {
  return {
    type: 'dm',
    id: item.otherUser?.userId,
    user: item.otherUser,
    title: displayName(item.otherUser),
    subtitle: item.otherUser?.email || item.otherUser?.role || 'Direct message',
    preview: item.lastMessage,
    lastActivityAt: item.lastActivityAt,
    lastSenderId: item.lastSenderId,
    raw: item,
  }
}

function toContactConversation(contact) {
  return {
    type: 'dm',
    id: contact.userId,
    user: contact,
    title: displayName(contact),
    subtitle: contact.email || contact.role || 'Direct message',
    preview: null,
    lastActivityAt: null,
    raw: null,
  }
}

function sameConversation(left, right) {
  return left?.type === right?.type && left?.id === right?.id
}

function compareActivity(left, right) {
  const leftTime = left ? new Date(left).getTime() : 0
  const rightTime = right ? new Date(right).getTime() : 0
  return rightTime - leftTime
}

function formatConversationTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatMessageTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function resolveConversation(inbox, currentConversation) {
  if (currentConversation?.type === 'group') {
    const matchedGroup = inbox.groups.find(group => group.eventId === currentConversation.eventId)
    if (matchedGroup) return toGroupConversation(matchedGroup)
  }

  if (currentConversation?.type === 'dm') {
    const matchedDm = inbox.directMessages.find(item => item.otherUser?.userId === currentConversation.id)
    if (matchedDm) return toDirectConversation(matchedDm)
    const matchedContact = inbox.contacts.find(contact => contact.userId === currentConversation.id)
    if (matchedContact) return toContactConversation(matchedContact)
  }

  const latestGroup = inbox.groups[0] ? toGroupConversation(inbox.groups[0]) : null
  const latestDirect = inbox.directMessages[0] ? toDirectConversation(inbox.directMessages[0]) : null
  const fallbackContact = inbox.contacts[0] ? toContactConversation(inbox.contacts[0]) : null

  if (latestGroup && latestDirect) {
    return compareActivity(latestGroup.lastActivityAt, latestDirect.lastActivityAt) <= 0 ? latestGroup : latestDirect
  }

  return latestDirect || latestGroup || fallbackContact || null
}

function matchesConversation(conversation, query) {
  if (!query) return true
  const value = query.toLowerCase()
  return [conversation.title, conversation.subtitle, conversation.preview]
    .some(field => field?.toLowerCase().includes(value))
}

function typePillClasses(type, active) {
  if (active) return 'bg-obsidian-900 text-cream shadow-sm'
  if (type === 'group') return 'bg-white text-obsidian-600 border border-obsidian-200'
  return 'bg-gold-50 text-gold-700 border border-gold-200'
}

function isVendorUser(user) {
  return user?.role?.toUpperCase() === 'VENDOR'
}

export default function ChatTab({ showToast, preferredUserId = null, onPreferredUserHandled }) {
  const { user, token, isOrganizer } = useAuth()
  const [inbox, setInbox] = useState(EMPTY_INBOX)
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [groupMembers, setGroupMembers] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('all')
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [sending, setSending] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [directoryUsers, setDirectoryUsers] = useState([])
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [dmModalOpen, setDmModalOpen] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [startingDm, setStartingDm] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [groupForm, setGroupForm] = useState(defaultGroupForm)
  const [selectedDmUserId, setSelectedDmUserId] = useState('')
  const [dmInitialMessage, setDmInitialMessage] = useState('')
  const [groupMemberSearch, setGroupMemberSearch] = useState('')
  const [dmSearch, setDmSearch] = useState('')
  const messageEndRef = useRef(null)
  const activeConversationRef = useRef(null)
  const refreshInboxRef = useRef(async () => {})
  const refreshConversationRef = useRef(async () => {})
  const conversationRequestRef = useRef(0)

  activeConversationRef.current = activeConversation

  const fetchInbox = async ({ silent = false } = {}) => {
    if (!silent) setLoadingInbox(true)
    try {
      const response = await chatApi.getInbox()
      const data = response.data || EMPTY_INBOX
      setInbox(data)
      setActiveConversation(current => resolveConversation(data, current))
    } catch {
      if (!silent) showToast('Failed to load chats', 'error')
    } finally {
      if (!silent) setLoadingInbox(false)
    }
  }

  const fetchConversation = async (conversation, { silent = false } = {}) => {
    if (!conversation) {
      setMessages([])
      setGroupMembers([])
      return
    }

    const requestId = conversationRequestRef.current + 1
    conversationRequestRef.current = requestId
    if (!silent) setLoadingConversation(true)

    try {
      if (conversation.type === 'group') {
        const [messagesResponse, membersResponse] = await Promise.all([
          chatApi.getGroupMessages(conversation.eventId),
          chatApi.getMembers(conversation.eventId),
        ])
        if (conversationRequestRef.current !== requestId) return
        setMessages(normalizeMessages(messagesResponse.data))
        setGroupMembers(Array.isArray(membersResponse.data) ? membersResponse.data : [])
      } else {
        const response = await chatApi.getDirectMessages(conversation.id)
        if (conversationRequestRef.current !== requestId) return
        setMessages(normalizeMessages(response.data))
        setGroupMembers([])
      }
    } catch {
      if (!silent) showToast('Failed to load messages', 'error')
    } finally {
      if (!silent && conversationRequestRef.current === requestId) {
        setLoadingConversation(false)
      }
    }
  }

  refreshInboxRef.current = fetchInbox
  refreshConversationRef.current = async () => {
    if (activeConversationRef.current) {
      await fetchConversation(activeConversationRef.current, { silent: true })
    }
  }

  useEffect(() => {
    fetchInbox({})
  }, [user?.email])

  useEffect(() => {
    if (!isOrganizer) {
      setTeamMembers([])
      return
    }

    const loadTeamMembers = async () => {
      try {
        const response = await usersApi.getByRole('TEAM_MEMBER')
        setTeamMembers(Array.isArray(response.data) ? response.data : [])
      } catch {
        showToast('Failed to load team members', 'error')
      }
    }

    loadTeamMembers()
  }, [isOrganizer, showToast])

  useEffect(() => {
    const loadDirectoryUsers = async () => {
      try {
        const response = await usersApi.getAll()
        const items = Array.isArray(response.data) ? response.data : []
        setDirectoryUsers(
          items.filter(item =>
            item?.userId !== user?.userId &&
            item?.isVerified !== false
          )
        )
      } catch {
        showToast('Failed to load users', 'error')
      }
    }

    if (user?.userId) {
      loadDirectoryUsers()
    }
  }, [showToast, user?.userId])

  useEffect(() => {
    fetchConversation(activeConversation, {})
  }, [activeConversation?.type, activeConversation?.id])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeConversation?.id, activeConversation?.type])

  useEffect(() => {
    if (!token) return undefined

    const stream = new EventSource(chatApi.streamUrl(token))
    const handleUpdate = async () => {
      await refreshInboxRef.current({ silent: true })
      await refreshConversationRef.current()
    }

    stream.addEventListener('chat-update', handleUpdate)
    return () => {
      stream.removeEventListener('chat-update', handleUpdate)
      stream.close()
    }
  }, [token])

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshInboxRef.current({ silent: true })
      refreshConversationRef.current()
    }, 12000)
    return () => window.clearInterval(interval)
  }, [])

  const groupConversations = useMemo(() => (inbox.groups || []).map(toGroupConversation), [inbox.groups])
  const directConversations = useMemo(() => (inbox.directMessages || []).map(toDirectConversation), [inbox.directMessages])
  const directConversationIds = useMemo(() => {
    return new Set((inbox.directMessages || []).map(item => item.otherUser?.userId).filter(Boolean))
  }, [inbox.directMessages])

  const dmDirectory = useMemo(() => {
    const merged = new Map()

    ;[...directoryUsers, ...(inbox.contacts || [])].forEach(item => {
      if (item?.userId && item.userId !== user?.userId) {
        merged.set(item.userId, item)
      }
    })

    return Array.from(merged.values()).sort((left, right) => displayName(left).localeCompare(displayName(right)))
  }, [directoryUsers, inbox.contacts, user?.userId])

  const startableContacts = useMemo(() => {
    return dmDirectory
      .filter(contact => !directConversationIds.has(contact.userId))
      .sort((left, right) => displayName(left).localeCompare(displayName(right)))
  }, [directConversationIds, dmDirectory])

  const selectedDmUser = useMemo(
    () => dmDirectory.find(item => Number(item.userId) === Number(selectedDmUserId)) || null,
    [dmDirectory, selectedDmUserId]
  )

  const filteredDmDirectory = useMemo(() => {
    const value = dmSearch.trim().toLowerCase()
    if (!value) return dmDirectory
    return dmDirectory.filter(item =>
      [displayName(item), item.email, item.role].some(field => field?.toLowerCase().includes(value))
    )
  }, [dmDirectory, dmSearch])

  const availableMembersToAdd = useMemo(() => {
    if (activeConversation?.type !== 'group') return []
    const currentMemberIds = new Set((groupMembers || []).map(member => member.userId))
    return teamMembers.filter(member => !currentMemberIds.has(member.userId))
  }, [activeConversation?.type, groupMembers, teamMembers])

  const selectedGroupMembers = useMemo(
    () => teamMembers.filter(member => groupForm.memberIds.includes(member.userId)),
    [groupForm.memberIds, teamMembers]
  )

  const filteredGroupMemberOptions = useMemo(() => {
    const value = groupMemberSearch.trim().toLowerCase()
    if (!value) return teamMembers
    return teamMembers.filter(member =>
      [displayName(member), member.email, member.role].some(field => field?.toLowerCase().includes(value))
    )
  }, [groupMemberSearch, teamMembers])

  const matchesDirectView = (item) => {
    if (viewMode === 'group') return false
    if (viewMode === 'vendor') {
      const target = item?.user || item
      return isVendorUser(target)
    }
    return true
  }

  const filteredGroups = useMemo(() => {
    if (viewMode === 'dm' || viewMode === 'vendor') return []
    return groupConversations.filter(conversation => matchesConversation(conversation, searchQuery))
  }, [groupConversations, searchQuery, viewMode])

  const filteredDirectMessages = useMemo(() => {
    return directConversations.filter(conversation => matchesDirectView(conversation) && matchesConversation(conversation, searchQuery))
  }, [directConversations, searchQuery, viewMode])

  const filteredStartableContacts = useMemo(() => {
    return startableContacts.filter(contact => {
      const value = searchQuery.toLowerCase()
      const matchesQuery = !value || [displayName(contact), contact.email, contact.role].some(field => field?.toLowerCase().includes(value))
      return matchesDirectView(contact) && matchesQuery
    })
  }, [searchQuery, startableContacts, viewMode])

  useEffect(() => {
    if (!preferredUserId || !user?.userId) return

    const normalizedUserId = Number(preferredUserId)
    if (!normalizedUserId || normalizedUserId === Number(user.userId)) return

    const existingConversation = directConversations.find(conversation => Number(conversation.id) === normalizedUserId)
    const contact = dmDirectory.find(item => Number(item.userId) === normalizedUserId)
    const targetConversation = existingConversation || (contact ? toContactConversation(contact) : null)

    if (!targetConversation) return

    setViewMode('dm')
    handleSelectConversation(targetConversation)
    onPreferredUserHandled?.()
  }, [preferredUserId, directConversations, dmDirectory, onPreferredUserHandled, user?.userId])

  const totalVisibleConversations = filteredGroups.length + filteredDirectMessages.length
  const totalKnownConversations = groupConversations.length + directConversations.length

  const handleSelectConversation = (conversation) => {
    setMessageText('')
    setSelectedMemberId('')
    setActiveConversation(conversation)
  }

  const handleSend = async (event) => {
    event.preventDefault()
    const text = messageText.trim()
    if (!text || !activeConversation) return

    setSending(true)
    try {
      const response = activeConversation.type === 'group'
        ? await chatApi.sendGroupMessage(activeConversation.eventId, { messageText: text })
        : await chatApi.sendDirectMessage(activeConversation.id, { messageText: text })
      setMessages(previous => [...previous, response.data])
      setMessageText('')
      await fetchInbox({ silent: true })
    } catch {
      showToast('Unable to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleAddMember = async () => {
    if (!activeConversation || activeConversation.type !== 'group') return
    if (!selectedMemberId) {
      showToast('Select a team member first', 'error')
      return
    }

    setAddingMember(true)
    try {
      await eventMembersApi.create({
        event: { eventId: activeConversation.eventId },
        user: { userId: Number(selectedMemberId) },
        roleInEvent: 'TEAM_MEMBER',
        status: 'ACTIVE',
      })
      setSelectedMemberId('')
      showToast('Team member added to the group')
      await fetchInbox({ silent: true })
      await fetchConversation(activeConversationRef.current, { silent: true })
    } catch {
      showToast('Unable to add team member', 'error')
    } finally {
      setAddingMember(false)
    }
  }

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!sending && messageText.trim()) handleSend(event)
    }
  }

  const openDmModal = () => {
    setSelectedDmUserId('')
    setDmInitialMessage('')
    setDmSearch('')
    setDmModalOpen(true)
  }

  const openCreateGroupModal = () => {
    setGroupForm(defaultGroupForm())
    setGroupMemberSearch('')
    setGroupModalOpen(true)
  }

  const toggleGroupMember = (memberId) => {
    setGroupForm(current => ({
      ...current,
      memberIds: current.memberIds.includes(memberId)
        ? current.memberIds.filter(id => id !== memberId)
        : [...current.memberIds, memberId],
    }))
  }

  const handleCreateGroup = async () => {
    if (!groupForm.eventName.trim()) {
      showToast('Group name is required', 'error')
      return
    }

    setCreatingGroup(true)
    try {
      const response = await eventsApi.create({
        eventName: groupForm.eventName.trim(),
        eventType: groupForm.eventType || 'Other',
        eventDate: groupForm.eventDate || new Date().toISOString().slice(0, 10),
        venue: groupForm.venue.trim() || 'Chat Workspace',
        description: groupForm.description.trim(),
        status: 'PLANNED',
      })

      const createdEvent = response.data
      await Promise.all(
        groupForm.memberIds.map(userId => eventMembersApi.create({
          event: { eventId: createdEvent.eventId },
          user: { userId },
          roleInEvent: 'TEAM_MEMBER',
          status: 'ACTIVE',
        }))
      )

      const nextConversation = {
        type: 'group',
        id: createdEvent.eventId,
        eventId: createdEvent.eventId,
        title: createdEvent.eventName,
        subtitle: createdEvent.eventType || createdEvent.venue || 'Event group chat',
        preview: null,
        lastActivityAt: null,
        participantCount: groupForm.memberIds.length + 1,
        raw: createdEvent,
      }

      setGroupModalOpen(false)
      await fetchInbox({ silent: true })
      setActiveConversation(nextConversation)
      await fetchConversation(nextConversation, { silent: true })
      showToast('Group created successfully')
    } catch {
      showToast('Unable to create group', 'error')
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleStartDm = async () => {
    const selectedUser = dmDirectory.find(item => Number(item.userId) === Number(selectedDmUserId))
    if (!selectedUser) {
      showToast('Select a user first', 'error')
      return
    }

    const nextConversation = toContactConversation(selectedUser)
    setStartingDm(true)
    try {
      if (dmInitialMessage.trim()) {
        await chatApi.sendDirectMessage(selectedUser.userId, { messageText: dmInitialMessage.trim() })
      }

      setDmModalOpen(false)
      setSelectedDmUserId('')
      setDmInitialMessage('')
      setDmSearch('')
      await fetchInbox({ silent: true })
      setActiveConversation(nextConversation)
      await fetchConversation(nextConversation, { silent: true })
      showToast(dmInitialMessage.trim() ? 'Direct message started' : 'Direct message ready')
    } catch {
      showToast('Unable to start direct message', 'error')
    } finally {
      setStartingDm(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!deleteTarget?.eventId) return

    setDeletingGroup(true)
    try {
      const deletingActiveConversation = sameConversation(activeConversationRef.current, deleteTarget)

      await chatApi.deleteGroup(deleteTarget.eventId)
      setDeleteTarget(null)
      if (deletingActiveConversation) {
        setMessageText('')
        setMessages([])
        setGroupMembers([])
      }
      await fetchInbox({ silent: true })
      showToast('Group deleted successfully')
    } catch {
      showToast('Unable to delete this group', 'error')
    } finally {
      setDeletingGroup(false)
    }
  }

  const renderConversationItem = (conversation, variant = conversation.type) => {
    const active = sameConversation(activeConversation, conversation)
    const isGroup = variant === 'group'
    const isVendorConversation = !isGroup && isVendorUser(conversation.user)
    const canDeleteGroup = isOrganizer && isGroup

    return (
      <div
        key={`${variant}-${conversation.id}`}
        className={`group relative rounded-2xl border transition-all ${
          active
            ? 'border-obsidian-900 bg-obsidian-900 text-cream shadow-md'
            : 'border-transparent bg-white/80 hover:border-obsidian-100 hover:bg-white hover:shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelectConversation(conversation)}
          className="w-full rounded-2xl px-3 py-3 text-left"
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${
              active
                ? 'bg-white/15 text-cream'
                : isGroup
                  ? 'bg-obsidian-100 text-obsidian-700'
                  : 'bg-gold-100 text-gold-700'
            }`}>
              {initials(conversation.title)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`truncate text-sm font-semibold ${active ? 'text-cream' : 'text-obsidian-900'}`}>
                    {conversation.title}
                  </div>
                  <div className={`mt-0.5 truncate text-xs ${active ? 'text-cream/70' : 'text-obsidian-400'}`}>
                    {conversation.subtitle}
                  </div>
                </div>
                <div className={`shrink-0 text-[11px] ${active ? 'text-cream/60' : 'text-obsidian-400'}`}>
                  {formatConversationTime(conversation.lastActivityAt || conversation.raw?.eventDate)}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.18em] ${
                  active
                    ? 'bg-white/10 text-cream/80'
                    : isGroup
                      ? 'bg-obsidian-100 text-obsidian-500'
                      : isVendorConversation
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gold-50 text-gold-700'
                }`}>
                  {isGroup ? 'GROUP' : isVendorConversation ? 'VENDOR' : 'DM'}
                </span>
                {isGroup && !!conversation.participantCount && (
                  <span className={`text-[11px] ${active ? 'text-cream/60' : 'text-obsidian-400'}`}>
                    {conversation.participantCount} members
                  </span>
                )}
                {isVendorConversation && (
                  <span className={`text-[11px] ${active ? 'text-cream/60' : 'text-obsidian-400'}`}>
                    Direct vendor contact
                  </span>
                )}
              </div>
              <div className={`mt-2 truncate text-xs ${active ? 'text-cream/75' : 'text-obsidian-500'}`}>
                {conversation.preview || (isGroup ? 'Open this event room' : 'Start a direct conversation')}
              </div>
            </div>
          </div>
        </button>

        {canDeleteGroup && (
          <button
            type="button"
            onClick={() => setDeleteTarget(conversation)}
            disabled={deletingGroup}
            className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-opacity ${
              active
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-red-200 bg-white text-red-600 opacity-0 shadow-sm pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100'
            } ${deletingGroup ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            Delete
          </button>
        )}
      </div>
    )
  }

  const renderMessageBubble = (message) => {
    const mine = Number(message.senderId) === Number(user?.userId)

    return (
      <div
        key={`${message.messageId || message.sentAt}-${message.senderId}-${message.messageText}`}
        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
          {!mine && (
            <div className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-obsidian-400">
              {message.senderName || message.senderEmail || 'Member'}
            </div>
          )}
          <div className={`rounded-[24px] px-4 py-3 shadow-sm ${
            mine
              ? 'rounded-br-md bg-obsidian-900 text-cream'
              : 'rounded-bl-md border border-obsidian-100 bg-white text-obsidian-900'
          }`}>
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.messageText}
            </div>
            <div className={`mt-2 text-[11px] ${mine ? 'text-cream/60' : 'text-obsidian-400'}`}>
              {formatMessageTime(message.sentAt)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const emptyConversationArt = (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute left-12 top-2 w-40 rounded-3xl border border-obsidian-100 bg-white/90 px-4 py-3 shadow-sm">
        <div className="h-2 w-14 rounded-full bg-gold-200" />
        <div className="mt-3 h-2 w-24 rounded-full bg-obsidian-100" />
        <div className="mt-2 h-2 w-16 rounded-full bg-obsidian-100" />
      </div>
      <div className="absolute right-14 top-16 w-48 rounded-3xl border border-obsidian-100 bg-obsidian-900 px-4 py-3 text-cream shadow-lg">
        <div className="h-2 w-20 rounded-full bg-white/30" />
        <div className="mt-3 h-2 w-32 rounded-full bg-white/20" />
        <div className="mt-2 h-2 w-24 rounded-full bg-white/20" />
      </div>
      <div className="absolute left-24 top-32 w-44 rounded-3xl border border-obsidian-100 bg-white/90 px-4 py-3 shadow-md">
        <div className="h-2 w-12 rounded-full bg-gold-200" />
        <div className="mt-3 h-2 w-28 rounded-full bg-obsidian-100" />
        <div className="mt-2 h-2 w-20 rounded-full bg-obsidian-100" />
      </div>
      <div className="relative pt-52 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-obsidian-100 bg-white text-xl font-semibold text-obsidian-400 shadow-sm">
          C
        </div>
        <h3 className="font-display text-2xl text-obsidian-900">
          {activeConversation ? 'You are starting a new conversation' : 'Chat workspace is ready'}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-obsidian-400">
          {activeConversation
            ? 'Type the first message below and the room will update instantly for everyone in this conversation.'
            : 'Create an event, assign team members, or start a direct message with a vendor or teammate to populate this workspace.'}
        </p>
        {!activeConversation && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isOrganizer && (
              <button className="btn-primary rounded-2xl px-5" onClick={openCreateGroupModal}>
                Create Group
              </button>
            )}
            <button className="btn-secondary rounded-2xl px-5" onClick={openDmModal}>
              Start DM
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="py-4">
      <div className="overflow-hidden rounded-[32px] border border-obsidian-100 bg-[#f8f6ef] shadow-[0_28px_80px_rgba(26,26,20,0.08)]">
        <div className="grid min-h-[720px] lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="flex flex-col border-r border-obsidian-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,246,239,0.92)_100%)]">
            <div className="border-b border-obsidian-100 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-obsidian-400">Workspace Chat</div>
                  <h2 className="mt-2 font-display text-2xl text-obsidian-900">Messages</h2>
                </div>
                <div className="rounded-full bg-obsidian-900 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cream">
                  {totalKnownConversations}
                </div>
              </div>

              <div className="mt-4">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search chats"
                  className="input-field rounded-2xl bg-white"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isOrganizer && (
                  <button className="btn-primary rounded-2xl px-4 py-2 text-xs" onClick={openCreateGroupModal}>
                    + Create Group
                  </button>
                )}
                <button className="btn-secondary rounded-2xl px-4 py-2 text-xs" onClick={openDmModal}>
                  + New DM
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {isOrganizer && (
                  <button
                    onClick={openCreateGroupModal}
                    className="rounded-3xl border border-obsidian-100 bg-white px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-700">Group Chat</div>
                    <div className="mt-2 text-base font-semibold text-obsidian-900">Create a team room</div>
                    <div className="mt-1 text-xs leading-5 text-obsidian-400">
                      Add members and open one shared space for event discussion.
                    </div>
                  </button>
                )}
                <button
                  onClick={openDmModal}
                  className="rounded-3xl border border-obsidian-100 bg-white px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-obsidian-500">Direct Message</div>
                  <div className="mt-2 text-base font-semibold text-obsidian-900">Message one person</div>
                  <div className="mt-1 text-xs leading-5 text-obsidian-400">
                    Pick a vendor or teammate and start a one-to-one conversation immediately.
                  </div>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'group', label: 'Groups' },
                  { id: 'dm', label: 'Direct' },
                  { id: 'vendor', label: 'Vendors' },
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.14em] transition-all ${typePillClasses(option.id, viewMode === option.id)}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {loadingInbox ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" className="text-obsidian-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-obsidian-400">Group Rooms</div>
                      <div className="text-[11px] text-obsidian-300">{filteredGroups.length}</div>
                    </div>
                    <div className="space-y-2">
                      {filteredGroups.length ? (
                        filteredGroups.map(conversation => renderConversationItem(conversation, 'group'))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-obsidian-200 bg-white/60 px-4 py-4 text-xs text-obsidian-400">
                          No group rooms match this view.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-obsidian-400">Direct Messages</div>
                      <div className="text-[11px] text-obsidian-300">{filteredDirectMessages.length}</div>
                    </div>
                    <div className="space-y-2">
                      {filteredDirectMessages.length ? (
                        filteredDirectMessages.map(conversation => renderConversationItem(conversation, 'dm'))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-obsidian-200 bg-white/60 px-4 py-4 text-xs text-obsidian-400">
                          No direct conversations yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {viewMode !== 'group' && (
                    <div>
                      <div className="mb-2 flex items-center justify-between px-2">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-obsidian-400">Start New</div>
                        <div className="text-[11px] text-obsidian-300">{filteredStartableContacts.length}</div>
                      </div>
                      <div className="space-y-2">
                        {filteredStartableContacts.length ? (
                          filteredStartableContacts.map(contact => renderConversationItem(toContactConversation(contact), 'dm'))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-obsidian-200 bg-white/60 px-4 py-4 text-xs text-obsidian-400">
                            Add more people or vendors to start new direct messages.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!totalVisibleConversations && !filteredStartableContacts.length && (
                    <div className="rounded-3xl border border-obsidian-100 bg-white px-4 py-5 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Tip</div>
                      <div className="mt-2 text-sm leading-6 text-obsidian-500">
                        Group rooms appear automatically from your events. Direct chats appear when your event members, registered vendors, or assigned teammates become available.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          <section className="flex min-h-[720px] flex-col bg-[radial-gradient(circle_at_top_left,_rgba(26,26,20,0.06),_transparent_28%),linear-gradient(180deg,_#fbfaf5_0%,_#f4f0e6_100%)]">
            <div className="border-b border-obsidian-100 bg-white/80 px-6 py-5 backdrop-blur">
              {activeConversation ? (
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] text-sm font-semibold ${
                      activeConversation.type === 'group'
                        ? 'bg-obsidian-900 text-cream'
                        : 'bg-gold-100 text-gold-700'
                    }`}>
                      {initials(activeConversation.title)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-2xl text-obsidian-900">{activeConversation.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.22em] ${
                          activeConversation.type === 'group'
                            ? 'bg-obsidian-100 text-obsidian-600'
                            : 'bg-gold-50 text-gold-700'
                        }`}>
                          {activeConversation.type === 'group' ? 'GROUP ROOM' : 'DIRECT MESSAGE'}
                        </span>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-green-700">
                          LIVE
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-obsidian-400">{activeConversation.subtitle}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeConversation.type === 'group' ? (
                          <>
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-obsidian-500 shadow-sm">
                              {groupMembers.length || activeConversation.participantCount || 0} members
                            </span>
                            {groupMembers.slice(0, 4).map(member => (
                              <span key={member.userId} className="rounded-full bg-white px-3 py-1 text-xs text-obsidian-500 shadow-sm">
                                {displayName(member)}
                              </span>
                            ))}
                          </>
                        ) : (
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-obsidian-500 shadow-sm">
                            {activeConversation.user?.email || 'One-to-one conversation'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isOrganizer && activeConversation.type === 'group' && (
                    <div className="w-full max-w-md rounded-[24px] border border-obsidian-100 bg-[#fcfbf7] p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-obsidian-400">Add Team Member</div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(activeConversation)}
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600 transition-colors hover:bg-red-100"
                        >
                          Delete Room
                        </button>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedMemberId}
                          onChange={(event) => setSelectedMemberId(event.target.value)}
                          className="input-field rounded-2xl bg-white"
                        >
                          <option value="">Choose a member</option>
                          {availableMembersToAdd.map(member => (
                            <option key={member.userId} value={member.userId}>
                              {displayName(member)}{member.isVerified === false ? ' (pending verification)' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn-primary rounded-2xl px-5"
                          onClick={handleAddMember}
                          disabled={addingMember || !availableMembersToAdd.length}
                        >
                          {addingMember ? <Spinner size="sm" /> : 'Add'}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 text-xs">
                        <div className="text-obsidian-400">
                          {availableMembersToAdd.length
                            ? 'New members join this room instantly once added.'
                            : 'All available team members are already in this room.'}
                        </div>
                        <div className="text-red-500">
                          Deleting removes this group room for everyone and clears its chat history.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-obsidian-400">Workspace Preview</div>
                  <h3 className="font-display text-2xl text-obsidian-900">Chat canvas</h3>
                  <p className="max-w-xl text-sm leading-6 text-obsidian-400">
                    Select a group room or a direct message from the left to open the conversation here.
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loadingConversation ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner size="lg" className="text-obsidian-400" />
                </div>
              ) : activeConversation && messages.length ? (
                <div className="space-y-4">
                  {messages.map(renderMessageBubble)}
                  <div ref={messageEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center py-8">
                  {emptyConversationArt}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-obsidian-100 bg-white/90 px-6 py-5 backdrop-blur">
              <div className="rounded-[28px] border border-obsidian-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex shrink-0 items-center gap-2 text-obsidian-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-obsidian-100 bg-obsidian-50 text-sm">+</span>
                    <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-obsidian-100 bg-obsidian-50 text-sm sm:flex">@</span>
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={activeConversation
                      ? activeConversation.type === 'group'
                        ? 'Type a message for the group...'
                        : `Type a message for ${activeConversation.title}...`
                      : 'Select a conversation to start typing...'}
                    rows={1}
                    disabled={!activeConversation}
                    className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-obsidian-900 placeholder:text-obsidian-400 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="btn-primary min-w-28 rounded-2xl"
                    disabled={sending || !messageText.trim() || !activeConversation}
                  >
                    {sending ? <Spinner size="sm" /> : 'Send'}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-obsidian-100 pt-3 text-[11px] uppercase tracking-[0.16em] text-obsidian-300">
                  <span>Instant updates enabled</span>
                  <span>
                    {activeConversation
                      ? activeConversation.type === 'group' ? 'Group room active' : 'Direct thread active'
                      : 'No conversation selected'}
                  </span>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>

      {groupModalOpen && (
        <Modal title="Create Group Chat" onClose={() => setGroupModalOpen(false)} size="lg">
          <div className="space-y-4">
            <p className="text-sm text-obsidian-400">
              This creates an event-backed group room so members can chat instantly.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Group Name">
                <input
                  value={groupForm.eventName}
                  onChange={(event) => setGroupForm({ ...groupForm, eventName: event.target.value })}
                  className="input-field"
                  placeholder="Team Launch Room"
                />
              </Field>

              <Field label="Group Type">
                <select
                  value={groupForm.eventType}
                  onChange={(event) => setGroupForm({ ...groupForm, eventType: event.target.value })}
                  className="input-field"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Date">
                <input
                  type="date"
                  value={groupForm.eventDate}
                  onChange={(event) => setGroupForm({ ...groupForm, eventDate: event.target.value })}
                  className="input-field"
                />
              </Field>

              <Field label="Venue / Label">
                <input
                  value={groupForm.venue}
                  onChange={(event) => setGroupForm({ ...groupForm, venue: event.target.value })}
                  className="input-field"
                  placeholder="Chat Workspace"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={groupForm.description}
                onChange={(event) => setGroupForm({ ...groupForm, description: event.target.value })}
                rows={3}
                className="input-field resize-none"
                placeholder="Optional group note"
              />
            </Field>

            <Field label="Add Team Members">
              <div className="space-y-3 rounded-2xl border border-obsidian-100 bg-[#faf8f2] p-3">
                <input
                  value={groupMemberSearch}
                  onChange={(event) => setGroupMemberSearch(event.target.value)}
                  className="input-field bg-white"
                  placeholder="Search team members"
                />
                {!!selectedGroupMembers.length && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupMembers.map(member => (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleGroupMember(member.userId)}
                        className="rounded-full bg-obsidian-900 px-3 py-1 text-xs text-cream"
                      >
                        {displayName(member)} x
                      </button>
                    ))}
                  </div>
                )}
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {filteredGroupMemberOptions.length ? filteredGroupMemberOptions.map(member => {
                    const selected = groupForm.memberIds.includes(member.userId)
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleGroupMember(member.userId)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                          selected
                            ? 'border-obsidian-900 bg-obsidian-900 text-cream'
                            : 'border-obsidian-100 bg-white text-obsidian-700 hover:border-gold-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{displayName(member)}</div>
                          <div className={`truncate text-xs ${selected ? 'text-cream/70' : 'text-obsidian-400'}`}>
                            {member.email}
                          </div>
                        </div>
                        <div className={`ml-3 rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.16em] ${
                          selected ? 'bg-white/10 text-cream' : 'bg-gold-50 text-gold-700'
                        }`}>
                          {selected ? 'SELECTED' : 'ADD'}
                        </div>
                      </button>
                    )
                  }) : (
                    <div className="text-sm text-obsidian-400">No matching team members found.</div>
                  )}
                </div>
              </div>
            </Field>

            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setGroupModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateGroup} disabled={creatingGroup}>
                {creatingGroup ? <Spinner size="sm" /> : 'Create Group'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {dmModalOpen && (
        <Modal title="Start Direct Message" onClose={() => setDmModalOpen(false)} size="md">
          <div className="space-y-4">
            <Field label="Choose User">
              <div className="space-y-3">
                <input
                  value={dmSearch}
                  onChange={(event) => setDmSearch(event.target.value)}
                  className="input-field"
                  placeholder="Search people by name or email"
                />
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-obsidian-100 bg-[#faf8f2] p-3">
                  {filteredDmDirectory.length ? filteredDmDirectory.map(item => {
                    const selected = Number(selectedDmUserId) === Number(item.userId)
                    return (
                      <button
                        key={item.userId}
                        type="button"
                        onClick={() => setSelectedDmUserId(String(item.userId))}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-all ${
                          selected
                            ? 'border-obsidian-900 bg-obsidian-900 text-cream'
                            : 'border-obsidian-100 bg-white text-obsidian-700 hover:border-gold-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{displayName(item)}</div>
                          <div className={`truncate text-xs ${selected ? 'text-cream/70' : 'text-obsidian-400'}`}>
                            {item.email}
                          </div>
                        </div>
                        <div className={`ml-3 rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.16em] ${
                          selected ? 'bg-white/10 text-cream' : 'bg-gold-50 text-gold-700'
                        }`}>
                          {selected ? 'SELECTED' : 'CHOOSE'}
                        </div>
                      </button>
                    )
                  }) : (
                    <div className="text-sm text-obsidian-400">No people match your search.</div>
                  )}
                </div>
                {selectedDmUser && (
                  <div className="rounded-2xl bg-obsidian-50 px-3 py-2 text-sm text-obsidian-600">
                    Messaging: <span className="font-medium text-obsidian-900">{displayName(selectedDmUser)}</span>
                  </div>
                )}
              </div>
            </Field>

            <Field label="First Message">
              <textarea
                value={dmInitialMessage}
                onChange={(event) => setDmInitialMessage(event.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Optional: type the first DM now"
              />
            </Field>

            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setDmModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleStartDm} disabled={startingDm}>
                {startingDm ? <Spinner size="sm" /> : 'Open DM'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Group Room"
          message={`Delete "${deleteTarget.title}"? This removes the room for all members and clears its chat history.`}
          onConfirm={handleDeleteGroup}
          onCancel={() => !deletingGroup && setDeleteTarget(null)}
          loading={deletingGroup}
        />
      )}
    </div>
  )
}
