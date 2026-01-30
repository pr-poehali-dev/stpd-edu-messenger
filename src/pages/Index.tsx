import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('diary');
  const [notifications] = useState([
    { id: 1, type: 'grade', message: 'Новая оценка по Математике: 5', time: '5 мин назад' },
    { id: 2, type: 'message', message: 'Новое сообщение от Иванова А.П.', time: '15 мин назад' },
    { id: 3, type: 'deadline', message: 'Срок сдачи работы по Физике: сегодня', time: '1 час назад' },
  ]);

  const diary = [
    { subject: 'Математика', grade: 5, teacher: 'Петрова М.И.', date: '30.01' },
    { subject: 'Физика', grade: 4, teacher: 'Сидоров П.К.', date: '30.01' },
    { subject: 'Литература', grade: 5, teacher: 'Иванова А.П.', date: '29.01' },
    { subject: 'Английский', grade: 4, teacher: 'Смирнов В.А.', date: '29.01' },
    { subject: 'История', grade: 5, teacher: 'Козлова Е.Н.', date: '28.01' },
  ];

  const lessons = [
    { title: 'Квадратные уравнения', subject: 'Математика', deadline: 'Сегодня, 18:00', status: 'active' },
    { title: 'Законы Ньютона', subject: 'Физика', deadline: 'Сегодня, 20:00', status: 'active' },
    { title: 'Война и мир - анализ', subject: 'Литература', deadline: 'Завтра, 15:00', status: 'upcoming' },
    { title: 'Present Perfect', subject: 'Английский', deadline: '01.02, 14:00', status: 'upcoming' },
  ];

  const chats = [
    { id: 1, name: 'Иванова А.П.', role: 'Учитель', message: 'Не забудьте сдать работу', time: '15:42', unread: 2, online: true },
    { id: 2, name: 'Петрова М.И.', role: 'Учитель', message: 'Отлично справились!', time: '14:20', unread: 0, online: true },
    { id: 3, name: 'Класс 10-А', role: 'Группа', message: 'Кто идет на факультатив?', time: '13:15', unread: 5, online: false },
    { id: 4, name: 'Сидоров П.К.', role: 'Учитель', message: 'Проверьте расписание', time: 'Вчера', unread: 0, online: false },
  ];

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
              <div className="relative">
                <Button variant="ghost" className="glossy-button-small text-white hover:bg-white/20">
                  <Icon name="Bell" size={20} />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-white">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>
              <Avatar className="glossy-avatar border-2 border-white shadow-lg">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold">
                  АС
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <Card className="glossy-card mb-6 p-4 border-l-4 border-l-orange-400">
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-2 hover:bg-white/50 rounded-lg transition-all">
                  <div className={`glossy-icon-badge ${
                    notif.type === 'grade' ? 'bg-green-500' : 
                    notif.type === 'message' ? 'bg-blue-500' : 
                    'bg-orange-500'
                  }`}>
                    <Icon 
                      name={notif.type === 'grade' ? 'Award' : notif.type === 'message' ? 'MessageSquare' : 'Clock'} 
                      size={16} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glossy-tabs w-full p-2 h-auto">
            <TabsTrigger value="diary" className="glossy-tab flex-1">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Дневник
            </TabsTrigger>
            <TabsTrigger value="chats" className="glossy-tab flex-1">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Чаты
            </TabsTrigger>
            <TabsTrigger value="lessons" className="glossy-tab flex-1">
              <Icon name="Notebook" size={18} className="mr-2" />
              Уроки
            </TabsTrigger>
            <TabsTrigger value="profile" className="glossy-tab flex-1">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="settings" className="glossy-tab flex-1">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diary" className="space-y-4">
            <Card className="glossy-card p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Icon name="Award" size={24} className="text-blue-500" />
                Электронный дневник
              </h2>
              <div className="space-y-3">
                {diary.map((entry, idx) => (
                  <div key={idx} className="glossy-item p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{entry.subject}</h3>
                        <p className="text-sm text-gray-600">Преподаватель: {entry.teacher}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{entry.date}</span>
                        <div className={`glossy-grade ${
                          entry.grade === 5 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          entry.grade === 4 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        }`}>
                          {entry.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            <div className="grid md:grid-cols-5 gap-4">
              <Card className="glossy-card md:col-span-2 p-4">
                <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <Icon name="Users" size={20} />
                  Контакты
                </h3>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div key={chat.id} className="glossy-chat-item p-3 rounded-xl cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="glossy-avatar-small">
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                {chat.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {chat.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800 truncate">{chat.name}</p>
                                <p className="text-xs text-gray-500">{chat.role}</p>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">{chat.time}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-600 truncate">{chat.message}</p>
                              {chat.unread > 0 && (
                                <Badge className="glossy-badge ml-2">{chat.unread}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="glossy-card md:col-span-3 p-4">
                <div className="h-[500px] flex flex-col">
                  <div className="glossy-chat-header p-3 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="glossy-avatar-small">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                          ИА
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">Иванова А.П.</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          В сети
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Avatar className="glossy-avatar-small w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                            ИА
                          </AvatarFallback>
                        </Avatar>
                        <div className="glossy-message-received max-w-[70%]">
                          <p className="text-sm text-gray-800">Добрый день! Не забудьте сдать работу по литературе до конца дня.</p>
                          <span className="text-xs text-gray-500 mt-1 block">15:42</span>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="glossy-message-sent max-w-[70%]">
                          <p className="text-sm text-white">Здравствуйте! Обязательно сдам до 18:00.</p>
                          <span className="text-xs text-blue-100 mt-1 block text-right">15:45</span>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="glossy-input-wrapper mt-4">
                    <Input 
                      placeholder="Введите сообщение..."
                      className="glossy-input pr-12"
                    />
                    <Button className="glossy-send-button">
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            <Card className="glossy-card p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Icon name="BookMarked" size={24} className="text-blue-500" />
                Активные уроки и задания
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lessons.map((lesson, idx) => (
                  <div key={idx} className={`glossy-lesson-card p-5 rounded-xl ${
                    lesson.status === 'active' ? 'border-l-4 border-l-orange-400' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                      <Badge className={lesson.status === 'active' ? 'glossy-badge-active' : 'glossy-badge-upcoming'}>
                        {lesson.status === 'active' ? 'Активно' : 'Скоро'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{lesson.subject}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Icon name="Clock" size={14} />
                      <span>Сдать до: {lesson.deadline}</span>
                    </div>
                    <Button className="glossy-button w-full mt-4">
                      Открыть урок
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="glossy-card p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="glossy-avatar-large mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl">
                    АС
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-gray-800">Александр Смирнов</h2>
                <p className="text-gray-600">Ученик 10-А класса</p>
                <Badge className="glossy-badge mt-2">ID: 20241234</Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glossy-info-card p-4 rounded-xl">
                  <Icon name="Award" size={20} className="text-blue-500 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Средний балл</h3>
                  <p className="text-3xl font-bold text-blue-600">4.7</p>
                </div>
                <div className="glossy-info-card p-4 rounded-xl">
                  <Icon name="BookOpen" size={20} className="text-green-500 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Выполнено уроков</h3>
                  <p className="text-3xl font-bold text-green-600">142</p>
                </div>
                <div className="glossy-info-card p-4 rounded-xl">
                  <Icon name="Calendar" size={20} className="text-orange-500 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Дней обучения</h3>
                  <p className="text-3xl font-bold text-orange-600">156</p>
                </div>
                <div className="glossy-info-card p-4 rounded-xl">
                  <Icon name="Trophy" size={20} className="text-purple-500 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Достижения</h3>
                  <p className="text-3xl font-bold text-purple-600">8</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="glossy-card p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Icon name="Settings" size={24} className="text-blue-500" />
                Настройки
              </h2>
              <div className="space-y-4">
                <div className="glossy-setting-item p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Bell" size={20} className="text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Уведомления</h3>
                        <p className="text-sm text-gray-600">Оповещения о новых событиях</p>
                      </div>
                    </div>
                    <Button className="glossy-button-small">
                      Настроить
                    </Button>
                  </div>
                </div>
                <div className="glossy-setting-item p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Palette" size={20} className="text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Тема оформления</h3>
                        <p className="text-sm text-gray-600">Глянцевая (2007)</p>
                      </div>
                    </div>
                    <Button className="glossy-button-small">
                      Изменить
                    </Button>
                  </div>
                </div>
                <div className="glossy-setting-item p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Shield" size={20} className="text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Приватность</h3>
                        <p className="text-sm text-gray-600">Управление данными и доступом</p>
                      </div>
                    </div>
                    <Button className="glossy-button-small">
                      Настроить
                    </Button>
                  </div>
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
                    <Button variant="destructive" className="glossy-button-small">
                      Выйти
                    </Button>
                  </div>
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
