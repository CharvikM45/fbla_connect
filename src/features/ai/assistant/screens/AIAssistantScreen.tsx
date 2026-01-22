// FBLA Connect - AI Assistant Screen
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { Text, TextInput, IconButton, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../../shared/theme';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

const quickPrompts = [
    { icon: '📅', text: 'What events should I attend?' },
    { icon: '📚', text: 'Explain the dress code' },
    { icon: '🏆', text: 'How do I prepare for Mobile App Dev?' },
    { icon: '📋', text: 'What are the SLC deadlines?' },
];

const initialMessages: Message[] = [
    {
        id: '1',
        type: 'assistant',
        content: "Hi! I'm your FBLA AI Assistant. I can help you with:\n\n• Event information and deadlines\n• Competition prep tips\n• FBLA guidelines and rules\n• Personalized recommendations\n\nWhat would you like to know?",
        timestamp: new Date(),
        suggestions: [
            'What events are coming up?',
            'How do I join a competition?',
            'Tell me about Mobile App Dev',
        ],
    },
];

export default function AIAssistantScreen() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI response (in production, this would call OpenAI API)
        setTimeout(() => {
            const response = generateResponse(text);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: response.content,
                timestamp: new Date(),
                suggestions: response.suggestions,
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    const generateResponse = (query: string): { content: string; suggestions?: string[] } => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('mobile app') || lowerQuery.includes('mad')) {
            return {
                content: "**Mobile Application Development** is a great choice! Here's what you need to know:\n\n📱 **2025-26 Theme**: \"Design the Future of Member Engagement\"\n\n**Requirements:**\n• Member profiles with secure login\n• Event calendar with reminders\n• Access to FBLA resources\n• News feed with announcements\n• Social media integration\n\n**Tips for Success:**\n1. Focus on user experience and accessibility\n2. Include innovative AI features\n3. Ensure code quality and documentation\n4. Practice your presentation\n\nWould you like me to create a prep timeline for you?",
                suggestions: [
                    'Create a prep timeline',
                    'What tools should I use?',
                    'Show me the rubric',
                ],
            };
        }

        if (lowerQuery.includes('dress code')) {
            return {
                content: "**FBLA Professional Dress Code** 👔\n\n**For All Members:**\n• Business professional attire required at all competitive events\n• Clean, pressed clothing\n• Closed-toe dress shoes\n\n**Specific Guidelines:**\n• Suits, dress pants, or professional skirts\n• Dress shirts or blouses\n• Ties optional but recommended\n• Conservative colors preferred\n• Minimal jewelry and accessories\n\n**Not Allowed:**\n• Jeans, shorts, or casual wear\n• Sneakers or sandals\n• Excessive accessories\n\nNeed help finding professional attire on a budget?",
                suggestions: [
                    'Budget professional wear tips',
                    'What about regional events?',
                ],
            };
        }

        if (lowerQuery.includes('slc') || lowerQuery.includes('state leadership')) {
            return {
                content: "**State Leadership Conference (SLC) Info** 🏆\n\n📅 **Key Dates:**\n• Registration Opens: January 15\n• Early Bird Deadline: February 15\n• Final Registration: March 1\n• Conference: April 10-12\n\n📍 **Location:**\nOmaha Marriott Downtown\n\n**What to Expect:**\n• Competitive events\n• Workshops and sessions\n• Networking opportunities\n• Awards ceremony\n• State officer elections\n\nAre you registered yet?",
                suggestions: [
                    'How do I register?',
                    'What events can I compete in?',
                    'SLC packing list',
                ],
            };
        }

        if (lowerQuery.includes('event') || lowerQuery.includes('competition')) {
            return {
                content: "Based on your interests in **Technology** and **Business**, here are events I recommend:\n\n🥇 **Top Picks for You:**\n\n1. **Mobile Application Development** - Build an app solving a business problem\n\n2. **Coding & Programming** - Demonstrate programming skills\n\n3. **Website Design** - Create a website for a business scenario\n\n4. **Social Media Strategies** - Develop a social media campaign\n\nWant me to tell you more about any of these?",
                suggestions: [
                    'Tell me about Mobile App Dev',
                    'How do I sign up?',
                    'Study resources for Coding',
                ],
            };
        }

        // Default response
        return {
            content: "I'd be happy to help with that! While I work on finding the best answer, here are some things I can definitely help you with:\n\n• 📅 Event schedules and deadlines\n• 📚 Competition guidelines and rubrics\n• 🎯 Personalized event recommendations\n• 📝 Study tips and resources\n• 👔 Dress code information\n\nCould you tell me more about what you're looking for?",
            suggestions: [
                'Upcoming deadlines',
                'Competition prep tips',
                'FBLA resources',
            ],
        };
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
            >
                {/* Quick Prompts */}
                {messages.length === 1 && (
                    <View style={styles.quickPromptsContainer}>
                        <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
                        <View style={styles.quickPromptsGrid}>
                            {quickPrompts.map((prompt, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.quickPrompt}
                                    onPress={() => sendMessage(prompt.text)}
                                >
                                    <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                                    <Text style={styles.quickPromptText}>{prompt.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Messages */}
                {messages.map(message => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onSuggestionPress={sendMessage}
                    />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color={colors.primary[600]} />
                            <Text style={styles.typingText}>AI is thinking...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask me anything about FBLA..."
                        style={styles.textInput}
                        mode="flat"
                        multiline
                        maxLength={500}
                        right={
                            <TextInput.Icon
                                icon="send"
                                color={inputText.trim() ? colors.primary[600] : colors.neutral[300]}
                                onPress={() => sendMessage(inputText)}
                                disabled={!inputText.trim()}
                            />
                        }
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

function MessageBubble({
    message,
    onSuggestionPress,
}: {
    message: Message;
    onSuggestionPress: (text: string) => void;
}) {
    const isUser = message.type === 'user';

    return (
        <View style={[styles.messageBubbleContainer, isUser && styles.userBubbleContainer]}>
            {!isUser && (
                <View style={styles.assistantAvatar}>
                    <Ionicons name="sparkles" size={16} color={colors.primary[600]} />
                </View>
            )}
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {message.content}
                </Text>
            </View>

            {message.suggestions && !isUser && (
                <View style={styles.suggestionsContainer}>
                    {message.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionChip}
                            onPress={() => onSuggestionPress(suggestion)}
                        >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    quickPromptsContainer: {
        marginBottom: spacing.lg,
    },
    quickPromptsTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    quickPromptsGrid: {
        gap: spacing.sm,
    },
    quickPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    quickPromptIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    quickPromptText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        flex: 1,
    },
    messageBubbleContainer: {
        marginBottom: spacing.md,
        alignItems: 'flex-start',
    },
    userBubbleContainer: {
        alignItems: 'flex-end',
    },
    assistantAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        backgroundColor: colors.primary[600],
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    messageText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[800],
        lineHeight: 24,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    suggestionsContainer: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    suggestionChip: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    suggestionText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[700],
    },
    typingContainer: {
        alignItems: 'flex-start',
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    typingText: {
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        padding: spacing.sm,
    },
    inputWrapper: {
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    textInput: {
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        maxHeight: 100,
    },
});
