package com.eventapp.service;

import com.eventapp.entity.GroupForum;
import com.eventapp.repository.GroupForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupForumService {
    private final GroupForumRepository groupForumRepository;

    public List<GroupForum> getAll() { return groupForumRepository.findAll(); }

    public Optional<GroupForum> getById(Integer id) { return groupForumRepository.findById(id); }

    public GroupForum create(GroupForum gf) { return groupForumRepository.save(gf); }

    public GroupForum update(Integer id, GroupForum updated) {
        return groupForumRepository.findById(id).map(gf -> {
            gf.setGroup(updated.getGroup());
            gf.setForumName(updated.getForumName());
            gf.setSpecialization(updated.getSpecialization());
            return groupForumRepository.save(gf);
        }).orElseThrow(() -> new RuntimeException("GroupForum not found: " + id));
    }

    public void delete(Integer id) { groupForumRepository.deleteById(id); }

    public List<GroupForum> getByGroup(Integer groupId) { return groupForumRepository.findByGroup_GroupId(groupId); }
}
