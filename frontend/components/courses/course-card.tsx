import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Course } from "@/lib/types"
import { Calendar, MapPin, Users } from "lucide-react"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const statusMap = {
    0: { label: "未开始", variant: "secondary" as const },
    1: { label: "进行中", variant: "default" as const },
    2: { label: "已结课", variant: "outline" as const },
  }

  const status = statusMap[course.status]
  const availableSeats = course.capacity - course.enrolled
  const isFullyBooked = availableSeats <= 0

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {course.image_url ? (
          <img src={course.image_url || "/placeholder.svg"} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-6xl font-bold text-primary/30">{course.title[0]}</span>
          </div>
        )}
        <Badge className="absolute right-3 top-3 text-base" variant={status.variant}>
          {status.label}
        </Badge>
      </div>

      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight">{course.title}</h3>
        </div>
        <Badge variant="outline" className="w-fit text-sm">
          {course.category}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        <p className="line-clamp-2 text-base leading-relaxed text-muted-foreground">{course.description}</p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 shrink-0" />
            <span className="text-base">{course.class_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <span className="text-base">{course.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0" />
            <span className="text-base">
              {course.enrolled}/{course.capacity} 人
              {isFullyBooked && <span className="ml-2 text-destructive">（已满）</span>}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Link href={`/courses/${course.course_id}`} className="w-full">
          <Button size="lg" className="h-12 w-full text-base font-semibold">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
