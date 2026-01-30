import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URLS = {
  auth: 'https://functions.poehali.dev/576b4f51-9ee4-4836-af29-c584d8c60e8d',
  profile: 'https://functions.poehali.dev/c015efbb-a8d8-44c0-902a-76cd0341d77e',
  messages: 'https://functions.poehali.dev/5e531b02-7a32-4580-ac8b-390c48f2e55b',
};

interface User {
  id: number;
  username: string;
  role: 'student' | 'teacher';
  class_number?: number;
  class_letter?: string;
  avatar_url?: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  sender_username?: string;
  sender_avatar?: string;
}

interface Conversation {
  other_user_id: number;
  username: string;
  role: string;
  class_number?: number;
  class_letter?: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [classNumber, setClassNumber] = useState('');
  const [classLetter, setClassLetter] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('stype_user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadConversations(user.id);
    }
  }, []);

  const loadConversations = async (userId: number) => {
    try {
      const response = await fetch(`${API_URLS.messages}?user_id=${userId}&action=conversations`);
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const action = isRegistering ? 'register' : 'login';
      const body: any = { action, username: username.trim(), password: password.trim() };
      
      if (isRegistering) {
        body.role = role;
        if (classNumber) body.class_number = parseInt(classNumber);
        if (classLetter.trim()) body.class_letter = classLetter.trim().toUpperCase();
      }

      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('stype_user', JSON.stringify(data.user));
        toast({ title: 'Успешно!', description: isRegistering ? 'Регистрация прошла успешно' : 'Вход выполнен' });
        loadConversations(data.user.id);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Что-то пошло не так', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast({ title: 'Ошибка', description: 'Введите минимум 2 символа', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URLS.auth}?action=search&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      if (data.users) {
        setSearchResults(data.users.filter((u: User) => u.id !== currentUser?.id));
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка поиска', variant: 'destructive' });
    }
  };

  const openChat = async (user: User) => {
    setSelectedChat(user);
    setActiveTab('chats');
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URLS.messages}?user_id=${currentUser.id}&other_user_id=${user.id}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !currentUser) return;

    try {
      const response = await fetch(API_URLS.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: selectedChat.id,
          message: messageInput.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setMessageInput('');
        loadConversations(currentUser.id);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(API_URLS.profile, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_avatar',
            user_id: currentUser.id,
            avatar_base64: reader.result,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
          localStorage.setItem('stype_user', JSON.stringify(data.user));
          toast({ title: 'Успешно!', description: 'Аватарка обновлена' });
        }
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить аватарку', variant: 'destructive' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('stype_user');
    setConversations([]);
    setSelectedChat(null);
    setMessages([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7fa9c7] via-[#a8c5d8] to-[#c4d9e8] flex items-center justify-center p-4">
        <Card className="glossy-card w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="glossy-logo mx-auto mb-4">
              <Icon name="GraduationCap" size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Stype</h1>
            <p className="text-gray-600">Образовательный мессенджер</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="username">Никнейм</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите никнейм"
                className="glossy-input"
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="glossy-input"
              />
            </div>

            {isRegistering && (
              <>
                <div>
                  <Label htmlFor="role">Роль</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as 'student' | 'teacher')}>
                    <SelectTrigger className="glossy-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Ученик</SelectItem>
                      <SelectItem value="teacher">Учитель</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classNumber">Класс</Label>
                      <Input
                        id="classNumber"
                        type="number"
                        value={classNumber}
                        onChange={(e) => setClassNumber(e.target.value)}
                        placeholder="10"
                        className="glossy-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="classLetter">Буква</Label>
                      <Input
                        id="classLetter"
                        value={classLetter}
                        onChange={(e) => setClassLetter(e.target.value.toUpperCase())}
                        placeholder="А"
                        maxLength={1}
                        className="glossy-input"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="glossy-button w-full">
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7fa9c7] via-[#a8c5d8] to-[#c4d9e8] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="glossy-header mb-6 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="glossy-logo">
                <Icon name="GraduationCap" size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-wide">Stype</h1>
                <p className="text-blue-100 text-sm">Образовательный мессенджер</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="glossy-avatar border-2 border-white shadow-lg">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold">
                  {currentUser?.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glossy-tabs w-full p-2 h-auto">
            <TabsTrigger value="chats" className="glossy-tab flex-1">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Чаты
            </TabsTrigger>
            <TabsTrigger value="search" className="glossy-tab flex-1">
              <Icon name="Search" size={18} className="mr-2" />
              Поиск
            </TabsTrigger>
            <TabsTrigger value="profile" className="glossy-tab flex-1">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="space-y-4">
            <div className="grid md:grid-cols-5 gap-4">
              <Card className="glossy-card md:col-span-2 p-4">
                <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <Icon name="Users" size={20} />
                  Контакты
                </h3>
                <ScrollArea className="h-[500px]">
                  {conversations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Нет чатов. Найдите пользователей в разделе "Поиск"</p>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <div
                          key={conv.other_user_id}
                          onClick={() => openChat({ id: conv.other_user_id, username: conv.username, role: conv.role as any, class_number: conv.class_number, class_letter: conv.class_letter, avatar_url: conv.avatar_url })}
                          className="glossy-chat-item p-3 rounded-xl cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="glossy-avatar-small">
                              <AvatarImage src={conv.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                {conv.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-800 truncate">{conv.username}</p>
                                  <p className="text-xs text-gray-500">
                                    {conv.role === 'teacher' ? 'Учитель' : `Ученик ${conv.class_number || ''}${conv.class_letter || ''}`}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 truncate mt-1">{conv.last_message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>

              <Card className="glossy-card md:col-span-3 p-4">
                {!selectedChat ? (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    Выберите чат для общения
                  </div>
                ) : (
                  <div className="h-[500px] flex flex-col">
                    <div className="glossy-chat-header p-3 rounded-xl mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="glossy-avatar-small">
                          <AvatarImage src={selectedChat.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                            {selectedChat.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{selectedChat.username}</p>
                          <p className="text-xs text-gray-500">
                            {selectedChat.role === 'teacher' ? 'Учитель' : `Ученик ${selectedChat.class_number || ''}${selectedChat.class_letter || ''}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-2 ${msg.sender_id === currentUser?.id ? 'justify-end' : ''}`}>
                            {msg.sender_id !== currentUser?.id && (
                              <Avatar className="glossy-avatar-small w-8 h-8">
                                <AvatarImage src={selectedChat.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                  {selectedChat.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={msg.sender_id === currentUser?.id ? 'glossy-message-sent max-w-[70%]' : 'glossy-message-received max-w-[70%]'}>
                              <p className={`text-sm ${msg.sender_id === currentUser?.id ? 'text-white' : 'text-gray-800'}`}>
                                {msg.message}
                              </p>
                              <span className={`text-xs mt-1 block ${msg.sender_id === currentUser?.id ? 'text-blue-100 text-right' : 'text-gray-500'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="glossy-input-wrapper mt-4">
                      <Input
                        placeholder="Введите сообщение..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="glossy-input pr-12"
                      />
                      <Button onClick={sendMessage} className="glossy-send-button">
                        <Icon name="Send" size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card className="glossy-card p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Icon name="Search" size={24} className="text-blue-500" />
                Поиск пользователей
              </h2>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Введите никнейм..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="glossy-input"
                />
                <Button onClick={handleSearch} className="glossy-button">
                  <Icon name="Search" size={18} />
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div key={user.id} className="glossy-item p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="glossy-avatar-small">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-800">{user.username}</h3>
                          <p className="text-sm text-gray-600">
                            {user.role === 'teacher' ? 'Учитель' : `Ученик ${user.class_number || ''}${user.class_letter || ''}`}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => openChat(user)} className="glossy-button-small">
                        Написать
                      </Button>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && searchQuery && (
                  <p className="text-gray-500 text-center py-8">Пользователи не найдены</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="glossy-card p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative">
                  <Avatar className="glossy-avatar-large mb-4">
                    <AvatarImage src={currentUser?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl">
                      {currentUser?.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-4 right-0 glossy-button-small cursor-pointer px-3 py-2">
                    <Icon name="Camera" size={16} />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{currentUser?.username}</h2>
                <p className="text-gray-600">
                  {currentUser?.role === 'teacher' ? 'Учитель' : `Ученик ${currentUser?.class_number || ''}${currentUser?.class_letter || ''}`}
                </p>
                <Badge className="glossy-badge mt-2">ID: {currentUser?.id}</Badge>
              </div>

              <div className="glossy-setting-item p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="LogOut" size={20} className="text-red-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Выход</h3>
                      <p className="text-sm text-gray-600">Выйти из аккаунта</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="destructive" className="glossy-button-small">
                    Выйти
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
