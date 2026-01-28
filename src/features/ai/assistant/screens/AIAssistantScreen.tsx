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
import { colors, spacing, typography, borderRadius, shadows } from '../../../../shared/theme';
import { MotiView } from 'moti';

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

        // Simulate AI response
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
        }, 1500);
    };

    const generateResponse = (query: string): { content: string; suggestions?: string[] } => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('mobile app') || lowerQuery.includes('mad')) {
            return {
                content: "**Mobile Application Development** is a great choice! Here's what you need to know:\n\n📱 **2025-26 Theme**: \"Design the Future of Member Engagement\"\n\n**Requirements:**\n• Member profiles with secure login\n• Event calendar with reminders\n• Access to FBLA resources\n• News feed with announcements\n• Social media integration\n\n**Tips for Success:**\n1. Focus on user experience and accessibility\n2. Include innovative AI features\n3. Ensure code quality and documentation\n\nWould you like me to create a prep timeline for you?",
                suggestions: [
                    'Create a prep timeline',
                    'Show me the rubric',
                ],
            };
        }

        return {
            content: "I'm looking into that for you! FBLA has a lot of great opportunities. Is there a specific division or category you're interested in?",
            suggestions: [
                'High School Division',
                'Middle School Division',
                'Collegiate Division',
            ],
        };
    };

    return (
        <View style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="sparkles-outline" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    <Text style={styles.headerSubtitle}>Get instant answers about FBLA</Text>
                </View>
            </View>
            
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.length === 1 && (
                        <View style={styles.quickPromptsContainer}>
                            <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
                            <View style={styles.quickPromptsGrid}>
                                {quickPrompts.map((prompt, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => sendMessage(prompt.text)}
                                    >
                                        <Card style={styles.quickPrompt}>
                                            <Card.Content style={styles.quickPromptContent}>
                                                <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                                                <Text style={styles.quickPromptText}>{prompt.text}</Text>
                                            </Card.Content>
                                        </Card>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {messages.map((message, index) => (
                        <MotiView
                            key={message.id}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 300 }}
                        >
                            <MessageBubble
                                message={message}
                                onSuggestionPress={sendMessage}
                            />
                        </MotiView>
                    ))}

                    {isTyping && (
                        <View style={styles.typingContainer}>
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size={12} color={colors.primary[600]} />
                                <Text style={styles.typingText}>Thinking...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <Card style={styles.inputWrapper}>
                        <View style={styles.inputRow}>
                            <TextInput
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Ask FBLA AI..."
                                placeholderTextColor={colors.neutral[400]}
                                style={styles.textInput}
                                textColor={colors.neutral[900]}
                                mode="flat"
                                multiline
                                maxLength={500}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                dense
                            />
                            <IconButton
                                icon="send"
                                iconColor={inputText.trim() ? colors.primary[600] : colors.neutral[300]}
                                size={24}
                                onPress={() => sendMessage(inputText)}
                                disabled={!inputText.trim()}
                            />
                        </View>
                    </Card>
                </View>
            </KeyboardAvoidingView>
        </View>
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
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble,
                shadows.sm
            ]}>
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
                            <View style={styles.suggestionInner}>
                                <Text style={styles.suggestionText}>{suggestion}</Text>
                            </View>
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
    headerContainer: {
        backgroundColor: colors.primary[600],
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: spacing.xl * 1.5,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    quickPromptsContainer: {
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    quickPromptsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.neutral[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    quickPromptsGrid: {
        gap: spacing.sm,
    },
    quickPrompt: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        elevation: 2,
    },
    quickPromptContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
    },
    quickPromptIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    quickPromptText: {
        fontSize: 14,
        color: colors.neutral[700],
        fontWeight: '600',
        flex: 1,
    },
    messageBubbleContainer: {
        marginBottom: spacing.lg,
        alignItems: 'flex-start',
    },
    userBubbleContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: spacing.md,
        borderRadius: 18,
    },
    userBubble: {
        borderBottomRightRadius: 2,
        backgroundColor: colors.primary[600],
    },
    assistantBubble: {
        borderBottomLeftRadius: 2,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    messageText: {
        fontSize: 15,
        color: colors.neutral[800],
        lineHeight: 22,
    },
    userMessageText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    suggestionsContainer: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    suggestionChip: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary[100],
    },
    suggestionInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionText: {
        fontSize: 13,
        color: colors.primary[600],
        fontWeight: '600',
    },
    typingContainer: {
        marginBottom: spacing.lg,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.neutral[100],
        alignSelf: 'flex-start',
    },
    typingText: {
        marginLeft: spacing.xs,
        fontSize: 12,
        color: colors.neutral[400],
        fontWeight: '600',
    },
    inputContainer: {
        padding: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing.md,
        backgroundColor: colors.neutral[50],
    },
    inputWrapper: {
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.sm,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'transparent',
        maxHeight: 120,
        fontSize: 15,
    },
});
