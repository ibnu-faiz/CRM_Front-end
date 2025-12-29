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
  return new Date(`${date}T${time}`).toISOString();
};

// Mengambil YYYY-MM-DD dari ISO String (dalam zona waktu LOKAL)
const formatToDateInput = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

// Mengambil HH:MM dari ISO String (dalam zona waktu LOKAL)
const formatToTimeInput = (isoString?: string) => {
  if (!isoString) return "09:00"; 
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(11, 16); 
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

  // --- State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); 
  const [startTime, setStartTime] = useState("09:00"); 
  const [endTime, setEndTime] = useState("10:00"); 
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [attendees, setAttendees] = useState<string[]>([]); 
  const [location, setLocation] = useState("");
  const [linkMeeting, setLinkMeeting] = useState("");
  const [reminder, setReminder] = useState("15min");
  const [outcome, setOutcome] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Ambil data Sales ---
  const { data: salesTeam, error: teamError } = useSWR<TeamMember[]>(
    `${API_URL}/sales`,
    fetcher
  );

  const salesOptions =
    salesTeam?.map((member) => ({
      value: member.id,
      label: member.name,
    })) || [];

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
          
          // --- FIX 1: Ambil Title dari schema baru ---
          setTitle(data.title || data.content || "");
          
          setDescription(meta.description || "");
          
          // Fallback waktu: scheduledAt (baru) atau meta.startTime (lama)
          const timeSource = data.scheduledAt || meta.startTime;
          
          setDate(formatToDateInput(timeSource));
          setStartTime(formatToTimeInput(timeSource));
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
        setDate(new Date().toISOString().split("T")[0]); 
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
    
    // Kalkulasi Waktu
    const finalStartTime = combineDateTime(date, startTime);
    const finalEndTime = combineDateTime(date, endTime);

    // Siapkan body untuk API
    const body = {
      type: ActivityType.MEETING,
      
      // --- FIX 2: Payload Schema Baru ---
      title: title,         // Masuk ke kolom 'title'
      description: description, // Masuk ke kolom 'description'
      scheduledAt: finalStartTime, // Masuk ke kolom 'scheduledAt' (PENTING BUAT KALENDER)
      location: location,   // Masuk ke kolom 'location'
      
      // Legacy Fallback
      content: title, 

      meta: {
        description,
        startTime: finalStartTime,
        endTime: finalEndTime,
        timezone,
        attendees,
        location,
        linkMeeting,
        reminder,
        outcome,
      },
    };

    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/meetings/${meetingId}`
      : `${API_URL}/leads/${leadId}/activities`;

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
      onMeetingAdded(); 
      onOpenChange(false); 
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