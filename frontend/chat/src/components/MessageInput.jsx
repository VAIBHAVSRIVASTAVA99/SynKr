import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/useGroupStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { sendMessage } = useChatStore();
  const { selectedGroup, sendGroupMessage } = useGroupStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const reader = new FileReader();

    reader.onloadend = () => {
      if (fileType.startsWith("image/")) {
        setImagePreview(reader.result);
        setVideoPreview(null);
      } else if (fileType.startsWith("video/")) {
        setVideoPreview(reader.result);
        setImagePreview(null);
      } else {
        toast.error("Please select an image or video file");
      }
    };

    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setImagePreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(",")[1]; // Get base64 data
          sendAudioToBackend(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // const sendAudioToBackend = async (base64Audio) => {
  //   try {
  //     const response = await fetch("http://localhost:5001/api/transcribe", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ audio: base64Audio, mimeType: "audio/wav", lang: "English" }),
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       setText(data.transcription); 
  //     } else {
  //       toast.error("Transcription failed");
  //     }
  //   } catch (error) {
  //     console.error("Error transcribing audio:", error);
  //     toast.error("Error transcribing audio.");
  //   }
  // };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !videoPreview) return;

    try {
      const messageData = {
        text: text.trim(),
        image: imagePreview,
        video: videoPreview,
      };

      if (selectedGroup) {
        await sendGroupMessage(messageData);
      } else {
        await sendMessage(messageData);
      }

      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full bg-gradient-to-t from-background/10 via-background/50 to-background/80 backdrop-blur-xl border-t">
      {(imagePreview || videoPreview) && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-primary-600/20"
              />
            )}
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="w-24 h-24 rounded-lg border border-primary-600/20"
              />
            )}
            <Button
              onClick={removeMedia}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm p-0 hover:bg-background"
              size="icon"
              variant="ghost"
              type="button"
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 text-black">
          <Input
            type="text"
            className={cn(
              "w-full bg-background/50 border-primary-600/20 text-black focus-visible:ring-primary-600/30",
              "placeholder:text-muted-foreground/50"
            )}
            placeholder={selectedGroup ? "Type a message to the group..." : "Type a message..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <Button
            type="button"
            className="hidden sm:flex"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="size-5 text-primary-600" />
          </Button>
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() && !imagePreview && !videoPreview}
          className="shrink-0"
        >
          <Send className="size-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;