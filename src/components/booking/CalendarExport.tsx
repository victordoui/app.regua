import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarExportProps {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  className?: string;
}

export const CalendarExport = ({
  title,
  description = "",
  location = "",
  startDate,
  endDate,
  className = "",
}: CalendarExportProps) => {
  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const formatDateForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const generateICSContent = (): string => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Na Régua//Agendamento//PT
BEGIN:VEVENT
UID:${Date.now()}@naregua.app
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${title}
END:VALARM
END:VEVENT
END:VCALENDAR`;
    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agendamento-${startDate.toISOString().split("T")[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = () => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: description,
      location: location,
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, "_blank");
  };

  const openOutlook = () => {
    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      subject: title,
      body: description,
      location: location,
    });
    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Calendar className="h-4 w-4" />
          Adicionar ao Calendário
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={openGoogleCalendar} className="gap-2 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12zM18 7.5H6V6h12v1.5z"
            />
          </svg>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openOutlook} className="gap-2 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.17 3H7.83A.83.83 0 007 3.83v16.34c0 .46.37.83.83.83h13.34c.46 0 .83-.37.83-.83V3.83a.83.83 0 00-.83-.83zM19.5 18h-9v-2h9v2zm0-4h-9v-2h9v2zm0-4h-9V8h9v2zM5 5H3v16h2V5z"
            />
          </svg>
          Outlook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadICS} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          Apple Calendar (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
