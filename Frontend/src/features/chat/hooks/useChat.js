import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, removeChat } from "../chat.slice";
import { useDispatch } from "react-redux";
import { useRef } from "react";

export const useChat = () => {

    const dispatch = useDispatch()
    const abortControllerRef = useRef(null)


    async function handleSendMessage({ message, chatId, model }) {
        dispatch(setLoading(true))
        abortControllerRef.current = new AbortController()

        try {
            const data = await sendMessage({ message, chatId, model, signal: abortControllerRef.current.signal })
            const { chat, aiMessage } = data
            if (!chatId)
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: message,
                role: "user",
            }))
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,
            }))
            dispatch(setCurrentChatId(chat._id))
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                console.log("Request aborted")
            } else {
                console.error("Failed to send message:", err)
            }
        } finally {
            dispatch(setLoading(false))
            abortControllerRef.current = null
        }
    }

    function abortMessage() {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

        console.log(chats[ chatId ]?.messages.length)

        if (chats[ chatId ]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
        } catch (err) {
            console.error("Failed to delete chat:", err)
        }
    }

    function handleStartNewChat() {
        dispatch(setCurrentChatId(null))
    }

    return {
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleStartNewChat,
        abortMessage
    }

}