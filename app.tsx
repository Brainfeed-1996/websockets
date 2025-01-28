import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, PenTool, Activity } from 'lucide-react';

// Mock WebSocket server URL (would need a real server in production)
const WS_URL = 'wss://echo.websocket.org';

function App() {
  // Chat Example
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const chatWs = useRef<WebSocket | null>(null);

  // Counter Example
  const [count, setCount] = useState(0);
  const counterWs = useRef<WebSocket | null>(null);

  // Drawing Example
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingWs = useRef<WebSocket | null>(null);

  // Server Status Example
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const statusWs = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connections
    chatWs.current = new WebSocket(WS_URL);
    counterWs.current = new WebSocket(WS_URL);
    drawingWs.current = new WebSocket(WS_URL);
    statusWs.current = new WebSocket(WS_URL);

    // Chat WebSocket handlers
    chatWs.current.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    // Counter WebSocket handlers
    counterWs.current.onmessage = (event) => {
      setCount(Number(event.data));
    };

    // Drawing WebSocket handlers
    drawingWs.current.onmessage = (event) => {
      const { x, y } = JSON.parse(event.data);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    // Status WebSocket handlers
    statusWs.current.onopen = () => setServerStatus('connected');
    statusWs.current.onclose = () => setServerStatus('disconnected');

    // Cleanup
    return () => {
      chatWs.current?.close();
      counterWs.current?.close();
      drawingWs.current?.close();
      statusWs.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (chatWs.current && messageInput) {
      chatWs.current.send(messageInput);
      setMessageInput('');
    }
  };

  const incrementCounter = () => {
    if (counterWs.current) {
      counterWs.current.send(String(count + 1));
    }
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      drawingWs.current?.send(JSON.stringify({ x, y }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">WebSocket Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Chat Example */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Real-time Chat</h2>
          </div>
          <div className="h-48 overflow-y-auto mb-4 bg-gray-50 p-4 rounded">
            {messages.map((msg, i) => (
              <div key={i} className="mb-2">{msg}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>

        {/* Counter Example */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-semibold">Synchronized Counter</h2>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">{count}</div>
            <button
              onClick={incrementCounter}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Increment
            </button>
          </div>
        </div>

        {/* Drawing Example */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Collaborative Drawing</h2>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseMove={handleDrawing}
            className="border rounded w-full bg-white"
          />
        </div>

        {/* Server Status Example */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-semibold">Server Status</h2>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-semibold ${
              serverStatus === 'connected' ? 'text-green-500' : 'text-red-500'
            }`}>
              {serverStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
            <div className={`w-4 h-4 rounded-full mx-auto mt-4 ${
              serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
