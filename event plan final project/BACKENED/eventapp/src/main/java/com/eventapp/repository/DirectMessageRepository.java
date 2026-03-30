package com.eventapp.repository;
import com.eventapp.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Integer> {
    List<DirectMessage> findByEvent_EventId(Integer eventId);
    List<DirectMessage> findBySender_UserIdAndReceiver_UserId(Integer senderId, Integer receiverId);

    @Query("select dm from DirectMessage dm where " +
           "((dm.sender.userId = :userA and dm.receiver.userId = :userB) or " +
           "(dm.sender.userId = :userB and dm.receiver.userId = :userA)) " +
           "order by dm.sentAt asc")
    List<DirectMessage> findConversation(@Param("userA") Integer userA,
                                         @Param("userB") Integer userB);

    @Query("select dm from DirectMessage dm where dm.sender.userId = :userId or dm.receiver.userId = :userId order by dm.sentAt desc")
    List<DirectMessage> findAllForUserOrderBySentAtDesc(@Param("userId") Integer userId);

    @Query("select count(dm) > 0 from DirectMessage dm where " +
           "((dm.sender.userId = :userA and dm.receiver.userId = :userB) or " +
           "(dm.sender.userId = :userB and dm.receiver.userId = :userA))")
    boolean existsConversationBetween(@Param("userA") Integer userA,
                                      @Param("userB") Integer userB);
}
