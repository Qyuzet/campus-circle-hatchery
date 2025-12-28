"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Users,
  Send,
  X,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { messagesAPI, groupsAPI, usersAPI } from "@/lib/api";
import {
  pusherClient,
  getConversationChannel,
  getGroupChannel,
} from "@/lib/pusher";
import { playNotificationSound } from "@/lib/notification-sound";
import { format } from "date-fns";
import { ConversationsList } from "./ConversationsList";
import { ChatArea } from "./ChatArea";

interface MessagesClientProps {
  initialConversations: any[];
  initialGroups: any[];
  currentUser: any;
  selectedConversationId?: string;
  selectedGroupId?: string;
  initialViewMode: "conversations" | "groups";
}

export function MessagesClient({
  initialConversations,
  initialGroups,
  currentUser,
  selectedConversationId,
  selectedGroupId,
  initialViewMode,
}: MessagesClientProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<"conversations" | "groups">(
    initialViewMode
  );
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(selectedConversationId || null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    selectedGroupId || null
  );
  const [conversations, setConversations] = useState(initialConversations);
  const [groups, setGroups] = useState(initialGroups);
  const [messages, setMessages] = useState<any[]>([]);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showMemberListSidebar, setShowMemberListSidebar] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, "HH:mm");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(messageDate, "dd/MM/yyyy");
    }
  };

  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      if (!silent) {
        setLoadingConversation(true);
      }
      const msgs = await messagesAPI.getMessages(conversationId);

      const hasNewMessages = msgs.length > lastMessageCountRef.current;

      if (silent && hasNewMessages) {
        const newMessagesCount = msgs.length - lastMessageCountRef.current;
        const hasNewMessagesFromOther = msgs
          .slice(-newMessagesCount)
          .some((msg: any) => msg.senderId !== currentUser?.id);

        if (hasNewMessagesFromOther) {
          playNotificationSound();
          toast.success("New message received!");
        }
      }

      setMessages(msgs);
      lastMessageCountRef.current = msgs.length;

      if (!silent || hasNewMessages) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      if (!silent) {
        toast.error("Failed to load messages");
      }
    } finally {
      if (!silent) {
        setLoadingConversation(false);
      }
    }
  };

  const loadGroupMessages = async (groupId: string, silent = false) => {
    try {
      if (!silent) {
        setLoadingConversation(true);
      }
      const msgs = await groupsAPI.getMessages(groupId);

      const hasNewMessages = msgs.length > lastMessageCountRef.current;

      if (silent && hasNewMessages) {
        const newMessagesCount = msgs.length - lastMessageCountRef.current;
        const hasNewMessagesFromOther = msgs
          .slice(-newMessagesCount)
          .some((msg: any) => msg.senderId !== currentUser?.id);

        if (hasNewMessagesFromOther) {
          playNotificationSound();
          toast.success("New group message!");
        }
      }

      setGroupMessages(msgs);
      lastMessageCountRef.current = msgs.length;

      if (!silent || hasNewMessages) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error loading group messages:", error);
      if (!silent) {
        toast.error("Failed to load messages");
      }
    } finally {
      if (!silent) {
        setLoadingConversation(false);
      }
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const group = groups.find((g) => g.id === groupId);
      if (group && group.members) {
        setGroupMembers(group.members);
      }
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation, true);
      }, 2000);

      const channelName = getConversationChannel(selectedConversation);
      const channel = pusherClient.subscribe(channelName);

      channel.bind("new-message", (newMessage: any) => {
        setMessages((prevMessages) => {
          const withoutOptimistic = prevMessages.filter(
            (msg) => !msg.id.startsWith("temp-")
          );
          const existingIndex = withoutOptimistic.findIndex(
            (msg) => msg.id === newMessage.id
          );
          if (existingIndex !== -1) {
            const updatedMessages = [...withoutOptimistic];
            updatedMessages[existingIndex] = newMessage;
            return updatedMessages;
          }
          return [...withoutOptimistic, newMessage];
        });

        setConversations((prevConvos) =>
          prevConvos.map((convo) =>
            convo.id === selectedConversation
              ? {
                  ...convo,
                  messages: [
                    {
                      id: newMessage.id,
                      content: newMessage.content,
                      createdAt: newMessage.createdAt,
                      senderId: newMessage.senderId,
                      sender: newMessage.sender,
                    },
                    ...convo.messages.slice(1),
                  ],
                }
              : convo
          )
        );

        if (newMessage.senderId !== currentUser?.id) {
          playNotificationSound();
          toast.success("New message received!", { duration: 2000 });
        }
      });

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [selectedConversation, currentUser]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMessages(selectedGroup);
      loadGroupMembers(selectedGroup);

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(() => {
        loadGroupMessages(selectedGroup, true);
      }, 2000);

      const channelName = getGroupChannel(selectedGroup);
      const channel = pusherClient.subscribe(channelName);

      channel.bind("new-group-message", (newMessage: any) => {
        setGroupMessages((prevMessages) => {
          const withoutOptimistic = prevMessages.filter(
            (msg) => !msg.id.startsWith("temp-")
          );
          const existingIndex = withoutOptimistic.findIndex(
            (msg) => msg.id === newMessage.id
          );
          if (existingIndex !== -1) {
            const updatedMessages = [...withoutOptimistic];
            updatedMessages[existingIndex] = newMessage;
            return updatedMessages;
          }
          return [...withoutOptimistic, newMessage];
        });

        if (newMessage.senderId !== currentUser?.id) {
          playNotificationSound();
          toast.success("New group message!", { duration: 2000 });
        }
      });

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [selectedGroup, currentUser]);

  useEffect(() => {
    const channels: any[] = [];

    conversations.forEach((conv) => {
      const channelName = getConversationChannel(conv.id);
      const channel = pusherClient.subscribe(channelName);
      channels.push({ name: channelName, channel });

      channel.bind("new-message", (newMessage: any) => {
        setConversations((prevConvos) =>
          prevConvos.map((convo) =>
            convo.id === conv.id
              ? {
                  ...convo,
                  messages: [
                    {
                      id: newMessage.id,
                      content: newMessage.content,
                      createdAt: newMessage.createdAt,
                      senderId: newMessage.senderId,
                      sender: newMessage.sender,
                    },
                    ...convo.messages.slice(1),
                  ],
                }
              : convo
          )
        );

        if (
          newMessage.senderId !== currentUser?.id &&
          conv.id !== selectedConversation
        ) {
          playNotificationSound();
        }
      });
    });

    return () => {
      channels.forEach(({ name, channel }) => {
        channel.unbind_all();
        pusherClient.unsubscribe(name);
      });
    };
  }, [conversations, currentUser, selectedConversation]);

  useEffect(() => {
    const channels: any[] = [];

    groups.forEach((group) => {
      const channelName = getGroupChannel(group.id);
      const channel = pusherClient.subscribe(channelName);
      channels.push({ name: channelName, channel });

      channel.bind("new-group-message", (newMessage: any) => {
        setGroups((prevGroups) =>
          prevGroups.map((g) =>
            g.id === group.id
              ? {
                  ...g,
                  messages: [
                    {
                      id: newMessage.id,
                      content: newMessage.content,
                      createdAt: newMessage.createdAt,
                      senderId: newMessage.senderId,
                      sender: newMessage.sender,
                    },
                    ...g.messages.slice(1),
                  ],
                }
              : g
          )
        );

        if (
          newMessage.senderId !== currentUser?.id &&
          group.id !== selectedGroup
        ) {
          playNotificationSound();
        }
      });
    });

    return () => {
      channels.forEach(({ name, channel }) => {
        channel.unbind_all();
        pusherClient.unsubscribe(name);
      });
    };
  }, [groups, currentUser, selectedGroup]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setIsSendingMessage(true);
      const content = messageText.trim();

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: currentUser?.id,
        sender: currentUser,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setMessageText("");

      await messagesAPI.sendMessage(selectedConversation, content);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendGroupMessage = async () => {
    if (!messageText.trim() || !selectedGroup) return;

    try {
      setIsSendingMessage(true);
      const content = messageText.trim();

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: currentUser?.id,
        sender: currentUser,
        createdAt: new Date(),
      };

      setGroupMessages((prev) => [...prev, optimisticMessage]);
      setMessageText("");

      await groupsAPI.sendMessage(selectedGroup, content);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error("Failed to send message");
      setGroupMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("temp-"))
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setSelectedGroup(null);
    router.push(`/dashboard/messages?conversation=${id}&mode=conversations`);
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroup(id);
    setSelectedConversation(null);
    router.push(`/dashboard/messages?group=${id}&mode=groups`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedGroup(null);
    router.push(`/dashboard/messages?mode=${viewMode}`);
  };

  const handleViewModeChange = (mode: "conversations" | "groups") => {
    setViewMode(mode);
    setSelectedConversation(null);
    setSelectedGroup(null);
    router.push(`/dashboard/messages?mode=${mode}`);
  };

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );
  const currentGroup = groups.find((g) => g.id === selectedGroup);

  const chatTitle = selectedConversation
    ? currentConversation?.user1.id === currentUser?.id
      ? currentConversation?.user2.name
      : currentConversation?.user1.name
    : selectedGroup
    ? currentGroup?.name
    : "";

  return (
    <div className="flex flex-col">
      <div className="bg-white rounded-lg shadow border border-light-gray h-[calc(100vh-12rem)] sm:h-[600px] flex flex-col sm:flex-row">
        <div
          className={`${
            selectedConversation || selectedGroup ? "hidden sm:flex" : "flex"
          } w-full sm:w-1/3 border-r border-light-gray flex-col min-h-0`}
        >
          <div className="p-4 border-b border-light-gray bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-dark-gray">Messages</h2>
              {viewMode === "groups" && (
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Create Group"
                >
                  <Plus className="h-5 w-5 text-dark-blue" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "conversations" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleViewModeChange("conversations")}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chats
              </Button>
              <Button
                variant={viewMode === "groups" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleViewModeChange("groups")}
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
            </div>
          </div>

          <ConversationsList
            conversations={conversations}
            groups={groups}
            viewMode={viewMode}
            selectedConversation={selectedConversation}
            selectedGroup={selectedGroup}
            currentUserId={currentUser?.id || ""}
            onSelectConversation={handleSelectConversation}
            onSelectGroup={handleSelectGroup}
            formatMessageTime={formatMessageTime}
            isLoadingConversations={isLoadingConversations}
            isLoadingGroups={isLoadingGroups}
            onCreateGroup={() => setShowCreateGroupModal(true)}
          />
        </div>

        {selectedConversation || selectedGroup ? (
          <ChatArea
            messages={selectedConversation ? messages : groupMessages}
            messageText={messageText}
            isSendingMessage={isSendingMessage}
            loadingConversation={loadingConversation}
            currentUserId={currentUser?.id || ""}
            chatTitle={chatTitle || ""}
            isGroup={!!selectedGroup}
            memberCount={
              selectedGroup
                ? groups.find((g) => g.id === selectedGroup)?.memberCount
                : undefined
            }
            onBack={handleBack}
            onMessageChange={setMessageText}
            onSendMessage={
              selectedConversation ? handleSendMessage : handleSendGroupMessage
            }
            onShowMembers={async () => {
              if (selectedGroup) {
                await loadGroupMembers(selectedGroup);
                setShowMemberListSidebar(true);
              }
            }}
            onAddMembers={() => {
              setShowAddMembersModal(true);
              setSelectedMembers([]);
              setUserSearchQuery("");
            }}
          />
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center text-medium-gray">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">
              Create New Group
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const description = formData.get("description") as string;

                try {
                  const newGroup = await groupsAPI.createGroup({
                    name,
                    description,
                    memberIds: selectedMembers.map((m) => m.id),
                  });
                  toast.success("Group created successfully!");
                  setShowCreateGroupModal(false);
                  setSelectedMembers([]);
                  setUserSearchQuery("");
                  setNewGroupName("");
                  setGroups((prev) => [newGroup, ...prev]);
                } catch (error) {
                  console.error("Error creating group:", error);
                  toast.error("Failed to create group");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Enter group description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Add Members (Optional)
                  </label>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setUserSearchQuery(query);
                      if (query.trim()) {
                        try {
                          const users = await usersAPI.getUsers(query);
                          setAvailableUsers(users);
                        } catch (error) {
                          console.error("Error searching users:", error);
                        }
                      } else {
                        setAvailableUsers([]);
                      }
                    }}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Search users by name or email..."
                  />

                  {userSearchQuery && availableUsers.length > 0 && (
                    <div className="mt-2 border border-light-gray rounded-lg max-h-48 overflow-y-auto">
                      {availableUsers
                        .filter(
                          (user) =>
                            !selectedMembers.find((m) => m.id === user.id) &&
                            user.id !== currentUser?.id
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedMembers([...selectedMembers, user]);
                              setUserSearchQuery("");
                              setAvailableUsers([]);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-light-gray last:border-b-0 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-dark-gray">
                                {user.name}
                              </div>
                              <div className="text-sm text-medium-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-dark-gray">
                        Selected Members ({selectedMembers.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-light-blue px-3 py-1 rounded-full"
                          >
                            <span className="text-sm text-dark-gray">
                              {member.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMembers(
                                  selectedMembers.filter(
                                    (m) => m.id !== member.id
                                  )
                                )
                              }
                              className="text-medium-gray hover:text-dark-gray"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setSelectedMembers([]);
                    setUserSearchQuery("");
                    setNewGroupName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-dark-blue hover:bg-blue-700"
                >
                  Create Group
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">
              Add Members to {groups.find((g) => g.id === selectedGroup)?.name}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (selectedMembers.length === 0) {
                  toast.error("Please select at least one member");
                  return;
                }

                try {
                  await groupsAPI.addMembers(
                    selectedGroup,
                    selectedMembers.map((m) => m.id)
                  );
                  toast.success("Members added successfully!");
                  setShowAddMembersModal(false);
                  setSelectedMembers([]);
                  setUserSearchQuery("");
                  loadGroupMembers(selectedGroup);
                } catch (error) {
                  console.error("Error adding members:", error);
                  toast.error("Failed to add members");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setUserSearchQuery(query);
                      if (query.trim()) {
                        try {
                          const users = await usersAPI.getUsers(query);
                          setAvailableUsers(users);
                        } catch (error) {
                          console.error("Error searching users:", error);
                        }
                      } else {
                        setAvailableUsers([]);
                      }
                    }}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Search users by name or email..."
                  />

                  {userSearchQuery && availableUsers.length > 0 && (
                    <div className="mt-2 border border-light-gray rounded-lg max-h-48 overflow-y-auto">
                      {availableUsers
                        .filter(
                          (user) =>
                            !selectedMembers.find((m) => m.id === user.id) &&
                            !groupMembers.find((m) => m.userId === user.id) &&
                            user.id !== currentUser?.id
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedMembers([...selectedMembers, user]);
                              setUserSearchQuery("");
                              setAvailableUsers([]);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-light-gray last:border-b-0 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-dark-gray">
                                {user.name}
                              </div>
                              <div className="text-sm text-medium-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-dark-gray">
                        Selected Members ({selectedMembers.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-light-blue px-3 py-1 rounded-full"
                          >
                            <span className="text-sm text-dark-gray">
                              {member.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMembers(
                                  selectedMembers.filter(
                                    (m) => m.id !== member.id
                                  )
                                )
                              }
                              className="text-medium-gray hover:text-dark-gray"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setSelectedMembers([]);
                    setUserSearchQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-dark-blue hover:bg-blue-700"
                >
                  Add Members
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberListSidebar && selectedGroup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={() => setShowMemberListSidebar(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-light-gray p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-gray">
                Group Members
              </h2>
              <button
                onClick={() => setShowMemberListSidebar(false)}
                className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-medium-gray">
                  {groupMembers.length} members
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowMemberListSidebar(false);
                    setShowAddMembersModal(true);
                  }}
                  className="bg-dark-blue hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Members
                </Button>
              </div>

              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 border border-light-gray rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-dark-gray">
                            {member.user.name}
                            {member.userId === currentUser?.id && (
                              <span className="ml-2 text-xs text-medium-gray">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-medium-gray">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                      {member.userId !== currentUser?.id && (
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `Remove ${member.user.name} from the group?`
                              )
                            ) {
                              try {
                                await groupsAPI.removeMember(
                                  selectedGroup,
                                  member.userId
                                );
                                toast.success("Member removed successfully!");
                                loadGroupMembers(selectedGroup);
                              } catch (error) {
                                console.error("Error removing member:", error);
                                toast.error("Failed to remove member");
                              }
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
