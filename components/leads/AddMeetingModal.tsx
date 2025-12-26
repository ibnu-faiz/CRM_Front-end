"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { LeadActivity, ActivityType, TeamMember } from "@/lib/types";
import useSWR from "swr";
import { MultiSelect } from "@/components/ui/multi-select";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  meetingId?: string | null;
  onMeetingAdded: () => void;
}

// --- Helper Functions ---

// Menggabungkan YYYY-MM-DD dan HH:MM menjadi ISO String (UTC)
const combineDateTime = (date?: string, time?: string) => {
  if (!date || !time) return null;
  // Ini akan membuat tanggal dalam zona waktu LOKAL browser
  // lalu .toISOString() akan mengonversinya ke UTC
  return new Date(`${date}T${time}`).toISOString();
};

// Mengambil YYYY-MM-DD dari ISO String (dalam zona waktu LOKAL)
const formatToDateInput = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Sesuaikan ke timezone lokal browser
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

// Mengambil HH:MM dari ISO String (dalam zona waktu LOKAL)
const formatToTimeInput = (isoString?: string) => {
  if (!isoString) return "09:00"; // Default jam 9 pagi
  const date = new Date(isoString);
  // Sesuaikan ke timezone lokal browser
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(11, 16); // "HH:MM"
};
// ---

export default function AddMeetingModal({
  open,
  onOpenChange,
  leadId,
  meetingId,
  onMeetingAdded,
}: AddMeetingModalProps) {
  const isEditMode = meetingId !== null && meetingId !== undefined;

  // --- State untuk semua field form ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState("09:00"); // HH:MM (24-jam)
  const [endTime, setEndTime] = useState("10:00"); // HH:MM (24-jam)
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [attendees, setAttendees] = useState<string[]>([]); // Array of user IDs
  const [location, setLocation] = useState("");
  const [linkMeeting, setLinkMeeting] = useState("");
  const [reminder, setReminder] = useState("15min");
  const [outcome, setOutcome] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Ambil data Sales untuk 'Attendees' ---
  const { data: salesTeam, error: teamError } = useSWR<TeamMember[]>(
    `${API_URL}/sales`,
    fetcher
  );

  // Opsi untuk MultiSelect
  const salesOptions =
    salesTeam?.map((member) => ({
      value: member.id,
      label: member.name,
    })) || [];

  // Opsi untuk Waktu (Select)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const suffix = i < 12 ? "AM" : "PM";
    const value = `${hour.toString().padStart(2, "0")}:00`;
    const label = `${displayHour}:00 ${suffix}`;
    return { value, label };
  });

  // Ambil data jika mode edit
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (isEditMode && open) {
        setLoading(true);
        try {
          const data = (await fetcher(
            `${API_URL}/leads/${leadId}/meetings/${meetingId}`
          )) as LeadActivity;

          const meta = data.meta || {};
          setTitle(data.content);
          setDescription(meta.description || "");
          setDate(formatToDateInput(meta.startTime));
          setStartTime(formatToTimeInput(meta.startTime));
          setEndTime(formatToTimeInput(meta.endTime));
          setTimezone(meta.timezone || "Asia/Jakarta");
          setAttendees(meta.attendees || []);
          setLocation(meta.location || "");
          setLinkMeeting(meta.linkMeeting || "");
          setReminder(meta.reminder || "15min");
          setOutcome(meta.outcome || "");
        } catch (err) {
          setError("Failed to load Meeting data");
          toast.error("Failed to load Meeting data");
        } finally {
          setLoading(false);
        }
      } else {
        // Reset form jika mode create
        setTitle("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]); // Default hari ini
        setStartTime("09:00");
        setEndTime("10:00");
        setTimezone("Asia/Jakarta");
        setAttendees([]);
        setLocation("");
        setLinkMeeting("");
        setReminder("15min");
        setOutcome("");
        setError("");
      }
    };
    fetchMeetingData();
  }, [isEditMode, open, meetingId, leadId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    // Siapkan body untuk API
    const body = {
      type: ActivityType.MEETING,
      content: title, // Title disimpan di 'content'
      meta: {
        // Sisanya disimpan di 'meta'
        description,
        startTime: combineDateTime(date, startTime), // Gabungkan
        endTime: combineDateTime(date, endTime), // Gabungkan
        timezone,
        attendees,
        location,
        linkMeeting,
        reminder,
        outcome,
      },
    };

    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/meetings/${meetingId}` // URL Update (PATCH)
      : `${API_URL}/leads/${leadId}/activities`; // URL Create (POST)

    const method = isEditMode ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save Meeting");
      }

      toast.success(
        isEditMode
          ? "Meeting successfully updated"
          : "Meeting successfully created"
      );
      onMeetingAdded(); // Panggil mutate (refresh list)
      onOpenChange(false); // Tutup modal
    } catch (err) {
      setError(err instanceof Error ? err.message : "There is an error");
      toast.error(err instanceof Error ? err.message : "There is an error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Meeting" : "Add New Meeting"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="meetingTitle">Meeting Title</Label>
            <Input
              id="meetingTitle"
              placeholder="Enter Meeting..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              rows={3}
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Time and Date Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Time and date</h3>

            {/* Date & Attendees */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="attendees">Attendees</Label>
                <MultiSelect
                  options={salesOptions}
                  selected={attendees}
                  onChange={setAttendees}
                  placeholder={
                    teamError
                      ? "Failed to load team"
                      : !salesTeam
                      ? "Loading team..."
                      : "Choose team..."
                  }
                  className="w-full"
                  disabled={loading || !!teamError || !salesTeam}
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="timezone">Time zone</Label>
                <Select
                  value={timezone}
                  onValueChange={setTimezone}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York
                    </SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location & Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Leave empty for online meetings"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="linkMeeting">Link Meeting</Label>
              <Input
                id="linkMeeting"
                placeholder="https://..."
                value={linkMeeting}
                onChange={(e) => setLinkMeeting(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="grid gap-1.5">
            <Label htmlFor="reminder">Reminder</Label>
            <Select
              value={reminder}
              onValueChange={setReminder}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">5 minutes before</SelectItem>
                <SelectItem value="10min">10 minutes before</SelectItem>
                <SelectItem value="15min">15 minutes before</SelectItem>
                <SelectItem value="30min">30 minutes before</SelectItem>
                <SelectItem value="1hour">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Outcome */}
          <div className="grid gap-1.5">
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              placeholder="Describe the meeting outcome..."
              rows={3}
              className="resize-none"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isEditMode ? (
              "Update Meeting"
            ) : (
              "Create Meeting"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
