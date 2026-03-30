package com.eventapp.repository;



import com.eventapp.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findByEventId(Integer eventId);

    List<Feedback> findByGuestEmail(String guestEmail);

}