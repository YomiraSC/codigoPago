"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Tooltip, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

const EventTooltip = ({ event }) => {
  return (
    <Box>
      <Typography variant="subtitle1"><strong>{event.title}</strong></Typography>
      <Typography variant="body2">Celular: {event.extendedProps.celular}</Typography>
      <Typography variant="body2">Estado: {event.extendedProps.estado}</Typography>
    </Box>
  );
};

const CalendarView = ({ calendarRef, events, loading }) => {
  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      {loading ? (
        <Skeleton variant="rectangular" height={500} />
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          selectable={true}
          selectMirror={true}
          eventContent={(eventInfo) => (
            <Tooltip title={<EventTooltip event={eventInfo.event} />} arrow>
              <Box sx={{ padding: "6px", backgroundColor: eventInfo.event.backgroundColor, color: "#fff" }}>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {eventInfo.event.title}
                </Typography>
                <Typography variant="caption">
                  {eventInfo.event.extendedProps.celular}
                </Typography>
              </Box>
            </Tooltip>
          )}
        />
      )}
    </Box>
  );
};

export default CalendarView;
