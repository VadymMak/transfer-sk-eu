import ScrollReveal from '@/components/ui/ScrollReveal';
import GoldDivider from '@/components/ui/GoldDivider';
import type { CourseItem } from '@/lib/types';

interface Props {
  courses?: CourseItem[];
}

export default function CoursesSection({ courses = [] }: Props) {
  if (courses.length === 0) return null;

  return (
    <section id="courses" className="section">
      <ScrollReveal className="section-header">
        <p className="section-label">Education</p>
        <h2 className="section-title">Learn from the Masters</h2>
        <GoldDivider />
        <p className="section-subtitle">
          Professional barbering courses taught by industry experts.
        </p>
      </ScrollReveal>

      <div className="courses-grid">
        {courses.map((course, i) => (
          <ScrollReveal key={course.id} direction="up" delay={i * 80}>
            <div className="course-card">
              <div className="course-card__header">
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__meta">{course.lessonCount} lessons</p>
              </div>
              <div className="course-card__footer">
                <span className="course-card__price">€{course.price}</span>
                <a href={`/courses/${course.slug}`} className="btn-primary">Enroll Now</a>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
