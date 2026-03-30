import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, TrendingUp, Users, Target, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { Avatar, AvatarFallback } from '../components/Avatar';
const suggestions = [{
        label: 'How can I increase my sales this quarter?',
        icon: TrendingUp
    }, {
        label: 'Analyze my top-performing products',
        icon: BarChart3
    }, {
        label: 'Customer retention strategies',
        icon: Users
    }, {
        label: 'How to reduce dead stock?',
        icon: Target
    }, {
        label: 'Marketing ideas for small retail',
        icon: Lightbulb
    }, {
        label: 'Pricing strategy recommendations',
        icon: Sparkles
    }];
const mockResponses = {
    'How can I increase my sales this quarter?': `Great question! Based on your current store data, here are some actionable strategies to boost sales this quarter:

**1. Leverage Trending Products**
Your Cargo Pants (+45%) and Bucket Hats (+71%) are seeing strong demand. Consider increasing stock and running targeted promotions on these items.

**2. Bundle Deals**
Create product bundles combining high-demand items with slower movers. For example, pair Oversized Tees with Crossbody Bags at a 15% discount.

**3. Seasonal Campaigns**
Launch a "Summer Essentials" campaign featuring your Linen Shirts and Canvas Sneakers. Use social media ads targeting your local demographic.

**4. Loyalty Program**
Implement a points-based loyalty program. Data shows retailers see a 20-30% increase in repeat purchases with well-structured rewards.

**5. Optimize Pricing**
Your Profit Margin is at 23.5%. Consider a small price increase (3-5%) on high-demand items — customers are less price-sensitive on trending products.

Would you like me to dive deeper into any of these strategies?`,
    'Analyze my top-performing products': `Here's an analysis of your top-performing products based on current market data:

**🏆 Top Performers:**

| Product | Demand Growth | Stock Status |
|---------|--------------|--------------|
| Bucket Hats | +71% | ⚠️ Out of Stock |
| Oversized Tees | +62% | ✅ Overstocked |
| Graphic Hoodies | +56% | ❌ Out of Stock |
| Crossbody Bags | +53% | ⚠️ Low Stock |

**Key Insights:**
- Your fastest-growing items (Bucket Hats, Graphic Hoodies) are out of stock — you're leaving significant revenue on the table.
- Oversized Tees are overstocked but still trending. Consider running a flash sale to optimize inventory.
- Crossbody Bags need immediate reorder to capitalize on the +53% demand surge.

**Recommended Actions:**
1. Emergency reorder for Bucket Hats and Graphic Hoodies
2. Allocate marketing budget to Crossbody Bags before stock runs out
3. Create an "Oversized Tees" promotion to balance inventory

Shall I help you create a reorder plan?`,
    'Customer retention strategies': `Here are proven customer retention strategies tailored for retail businesses:

**1. Personalized Communication**
- Send targeted emails based on purchase history
- Birthday discounts and anniversary offers
- "We miss you" campaigns for inactive customers (30+ days)

**2. Post-Purchase Experience**
- Handwritten thank-you notes with orders
- Follow-up emails asking for feedback
- Surprise upgrades or free samples

**3. Community Building**
- Create a VIP customer group on social media
- Host exclusive early-access sales events
- Share behind-the-scenes content about your products

**4. Data-Driven Approach**
- Track customer lifetime value (CLV)
- Identify at-risk customers before they churn
- A/B test different retention offers

**5. Subscription Model**
- Offer a monthly "style box" subscription
- Provide subscriber-only discounts
- Create a predictable revenue stream

**Industry Benchmark:** Top retail businesses retain 60-70% of customers. Would you like me to help you set up a retention tracking system?`,
    default: `That's a great area to explore! Based on my analysis of your business data and current market trends, here are some insights:

**Market Overview:**
Your store is performing well with a 23.5% profit margin and $12,426 in daily sales. However, there are opportunities to optimize:

- **Inventory Health:** You have $3,200 in dead stock that could be liquidated through flash sales or bundle deals
- **Demand Gaps:** Several trending products are out of stock, representing missed revenue
- **Growth Potential:** Your market demand forecast shows consistent upward trajectory

**Recommendations:**
1. Focus on restocking high-demand items immediately
2. Implement dynamic pricing for trending products
3. Consider expanding into adjacent product categories
4. Invest in digital marketing for your top performers

Would you like me to elaborate on any of these points or explore a different aspect of your business?`
};
export function BusinessCopilot() {
    const [messages, setMessages] = useState([{
            id: 'welcome',
            role: 'assistant',
            content: "👋 Hi! I'm your Business Copilot — an AI research assistant designed to help you grow your retail business. Ask me anything about sales strategies, market trends, inventory optimization, or customer insights. What would you like to explore today?",
            timestamp: new Date()
        }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    const sendMessage = (text) => {
        if (!text.trim())
            return;
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        // Simulate AI response
        setTimeout(() => {
            const response = mockResponses[text.trim()] || mockResponses['default'];
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };
    const handleSuggestion = (label) => {
        sendMessage(label);
    };
    const handleNewChat = () => {
        setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "👋 Hi! I'm your Business Copilot — an AI research assistant designed to help you grow your retail business. Ask me anything about sales strategies, market trends, inventory optimization, or customer insights. What would you like to explore today?",
                timestamp: new Date()
            }]);
        setInput('');
        inputRef.current?.focus();
    };
    const showSuggestions = messages.length <= 1 && !isTyping;
    return <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4
        }} className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Business Copilot
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered research assistant to help grow your business
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat} className="gap-2 rounded-xl border-border">
          <RefreshCw className="w-4 h-4"/>
          New Chat
        </Button>
      </motion.div>

      {/* Chat Area */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.1
        }} className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden transition-colors duration-300">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg) => <motion.div key={msg.id} initial={{
                opacity: 0,
                y: 10
            }} animate={{
                opacity: 1,
                y: 0
            }} transition={{
                duration: 0.3
            }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {msg.role === 'assistant' ? <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-500"/>
                  </div> : <Avatar size="sm">
                    <AvatarFallback className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl">
                      You
                    </AvatarFallback>
                  </Avatar>}

                {/* Message Bubble */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-md' : 'bg-secondary text-foreground rounded-tl-md'}`}>
                  {msg.role === 'assistant' ? <div className="whitespace-pre-wrap">
                      {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mt-2 mb-1">
                              {line.replace(/\*\*/g, '')}
                            </p>;
                    }
                    if (line.startsWith('| ')) {
                        return <p key={i} className="font-mono text-xs text-muted-foreground">
                              {line}
                            </p>;
                    }
                    if (line.match(/^\d+\./)) {
                        return <p key={i} className="ml-2 my-0.5">
                              {line}
                            </p>;
                    }
                    if (line.startsWith('- ')) {
                        return <p key={i} className="ml-4 my-0.5">
                              {line}
                            </p>;
                    }
                    return <p key={i} className={line === '' ? 'h-2' : ''}>
                            {line}
                          </p>;
                })}
                    </div> : <p>{msg.content}</p>}
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}
                  </p>
                </div>
              </motion.div>)}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && <motion.div initial={{
                opacity: 0,
                y: 10
            }} animate={{
                opacity: 1,
                y: 0
            }} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Brain className="w-4 h-4 text-emerald-500"/>
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
            }}/>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
            }}/>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
            }}/>
                </div>
              </div>
            </motion.div>}

          <div ref={messagesEndRef}/>
        </div>

        {/* Suggestions + Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          {/* Suggestion Bubbles */}
          <AnimatePresence>
            {showSuggestions && <motion.div initial={{
                opacity: 0,
                y: 10
            }} animate={{
                opacity: 1,
                y: 0
            }} exit={{
                opacity: 0,
                y: 10
            }} transition={{
                duration: 0.3
            }} className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s, i) => <motion.button key={s.label} initial={{
                    opacity: 0,
                    scale: 0.9
                }} animate={{
                    opacity: 1,
                    scale: 1
                }} transition={{
                    duration: 0.2,
                    delay: i * 0.05
                }} onClick={() => handleSuggestion(s.label)} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground bg-secondary hover:bg-muted hover:text-foreground border border-border rounded-xl transition-all duration-200 hover:border-emerald-500/30 hover:shadow-sm">
                    <s.icon className="w-3.5 h-3.5 text-emerald-500"/>
                    {s.label}
                  </motion.button>)}
              </motion.div>}
          </AnimatePresence>

          {/* Input Field */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about sales strategies, market trends, growth ideas..." className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" disabled={isTyping}/>
            </div>
            <Button type="submit" disabled={!input.trim() || isTyping} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 h-[46px] disabled:opacity-40">
              <Send className="w-4 h-4"/>
            </Button>
          </form>
        </div>
      </motion.div>
    </div>;
}
