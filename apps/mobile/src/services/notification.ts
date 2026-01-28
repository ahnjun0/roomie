import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

const CHANNEL_ID = 'roomie-chat';
const CHANNEL_NAME = 'Roomie 채팅';

let isChannelCreated = false;

async function ensureChannel() {
  if (isChannelCreated) return CHANNEL_ID;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  isChannelCreated = true;
  return CHANNEL_ID;
}

export interface ChatNotificationParams {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function showChatNotification({
  title,
  body,
  data,
}: ChatNotificationParams): Promise<void> {
  try {
    const channelId = await ensureChannel();

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        sound: 'default',
        style: {
          type: AndroidStyle.BIGTEXT,
          text: body,
        },
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
}
