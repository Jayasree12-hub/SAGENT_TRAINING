package com.eventapp.repository;
import com.eventapp.entity.GroupForum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface GroupForumRepository extends JpaRepository<GroupForum, Integer> {
    List<GroupForum> findByGroup_GroupId(Integer groupId);
    Optional<GroupForum> findFirstByGroup_GroupId(Integer groupId);
}
