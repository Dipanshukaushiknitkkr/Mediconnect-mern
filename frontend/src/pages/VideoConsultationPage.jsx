import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Send, User, Signal, RefreshCw, MessageSquare } from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...(import.meta.env.VITE_TURN_URL
      ? [
          {
            urls: import.meta.env.VITE_TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL
          }
        ]
      : [])
  ]
};

const VideoConsultationPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const userNameParam = searchParams.get('name');
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const toast = useToast();

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [remoteUser, setRemoteUser] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const displayName = user?.name || userNameParam || 'Consultation User';

  useEffect(() => {
    // 1. Initialize Media & WebRTC Peer Connection
    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/Mic permission warning:', err.message);
        toast.info('Previewing video consultation room. Grant media permissions for full video.');
      }
    };

    initWebRTC();

    if (!socket) return;

    // 2. Connect Socket with Fresh Auth Payload
    const token = localStorage.getItem('token');
    socket.auth = { token, userName: displayName };

    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();

    const handleConnect = () => {
      socket.emit('join-room', { roomId });
    };

    const handleConnectError = (err) => {
      console.error('Socket connection error:', err.message);
      toast.error('Could not connect to the consultation server. Please refresh.');
    };

    socket.once('connect', handleConnect);
    socket.on('connect_error', handleConnectError);

    // Chat Listeners
    socket.on('chat-history', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    // WebRTC Signaling Handlers
    socket.on('user-joined', async ({ userName, socketId }) => {
      setRemoteUser(userName);
      toast.success(`${userName} joined the consultation call!`);
      createPeerConnection(socketId, true);
    });

    socket.on('webrtc-offer', async ({ offer, senderSocketId }) => {
      if (!peerConnectionRef.current) {
        createPeerConnection(senderSocketId, false);
      }
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('webrtc-answer', { roomId, answer });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('Error setting remote answer:', err);
      }
    });

    socket.on('webrtc-candidate', async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    socket.on('user-left', () => {
      setRemoteUser(null);
      setHasRemoteVideo(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      toast.info('Participant disconnected from call.');
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('chat-history');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-candidate');
      socket.off('user-left');
    };
  }, [socket, roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const createPeerConnection = async (targetSocketId, isInitiator) => {
    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local stream tracks to PeerConnection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Receive remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setHasRemoteVideo(true);
          }
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc-candidate', { roomId, candidate: event.candidate });
        }
      };

      // Create Offer if Initiator
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { roomId, offer });
      }
    } catch (err) {
      console.error('PeerConnection Creation Failed:', err);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
        toast.info(micActive ? 'Microphone Muted 🔇' : 'Microphone Unmuted 🎙️');
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !camActive;
        setCamActive(!camActive);
        toast.info(camActive ? 'Camera Disabled 📹' : 'Camera Enabled 📷');
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket) return;

    socket.emit('send-message', {
      roomId,
      message: inputMsg
    });

    setInputMsg('');
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    toast.info('Consultation session ended.');
    if (user?.role === 'DOCTOR') navigate('/doctor-dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row p-4 gap-4">
      
      {/* LEFT PANEL: HD VIDEO ROOM */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        
        {/* Top Header */}
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <h2 className="font-bold text-sm text-white">Telehealth Encrypted WebRTC Consultation</h2>
              <p className="text-[11px] text-slate-400">Room ID: {roomId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Signal className="w-3.5 h-3.5" />
            <span>HD 1080p • Encrypted</span>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative flex-1 min-h-[440px] glass-panel rounded-3xl overflow-hidden flex items-center justify-center bg-slate-900 border-slate-800">
          
          {/* Remote Peer Video Stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${hasRemoteVideo ? 'block' : 'hidden'}`}
          />

          {/* Placeholder when remote peer has not joined */}
          {!hasRemoteVideo && (
            <div className="text-center p-6 space-y-4">
              <div className="relative w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 border border-slate-700">
                <User className="w-12 h-12" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 animate-ping"></div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {remoteUser ? `${remoteUser} (Connecting Audio/Video...)` : 'Waiting for participant to join room...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">End-to-End Encrypted WebRTC Consultation Channel</p>
              </div>

              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Waiting for peer WebRTC handshake...</span>
              </div>
            </div>
          )}

          {/* Self Camera Picture-in-Picture Preview */}
          <div className="absolute bottom-4 right-4 w-40 h-28 sm:w-48 sm:h-36 rounded-2xl glass-panel overflow-hidden border-2 border-blue-500/50 shadow-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur">
              You ({displayName})
            </span>
          </div>

        </div>

        {/* Floating Call Controls Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-center space-x-4">
          <button
            aria-label={micActive ? 'Mute microphone' : 'Unmute microphone'}
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl transition-all ${
              micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            }`}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            aria-label={camActive ? 'Turn off camera' : 'Turn on camera'}
            onClick={toggleCam}
            className={`p-3.5 rounded-2xl transition-all ${
              camActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            }`}
          >
            {camActive ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            aria-label="End call"
            onClick={handleEndCall}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xl hover:scale-105 transition-transform"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

      </div>

      {/* RIGHT PANEL: LIVE CONSULTATION CHAT */}
      <div className="w-full lg:w-96 glass-panel rounded-3xl p-5 flex flex-col justify-between border-slate-800 h-[600px] lg:h-auto">
        
        {/* Chat Header */}
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Consultation Chat</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
            Encrypted
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 max-h-[460px]">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                  msg.senderName === displayName
                    ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                    : 'mr-auto bg-slate-900 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                <span className="font-bold text-[10px] opacity-75 block mb-0.5">{msg.senderName}</span>
                <p className="leading-relaxed">{msg.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-500 py-16">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>Send a message to start live consultation chat...</p>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" aria-label="Send message" className="p-2.5 rounded-xl gradient-btn text-white">
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};

export default VideoConsultationPage;
