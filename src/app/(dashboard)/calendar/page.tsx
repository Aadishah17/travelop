import { PageHeader } from "@/components/layout/page-header";
import { TripCalendarPlanner } from "@/features/calendar/trip-calendar-planner";

export const metadata = {
  title: "Calendar Planner",
};

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar Planner"
        description="Schedule activities across monthly, weekly, and daily calendar views synchronized with your itinerary timeline."
      />
      <TripCalendarPlanner />
    </>
  );
}
