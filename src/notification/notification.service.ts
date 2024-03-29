import { Injectable } from '@nestjs/common';
import {
  Follower,
  Notification,
  NotificationSettings,
  Posts,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { P } from 'src/types';
import { EditNotificationSettingsDto } from './dtos/EditNotificationSettings.dto';
import { INotificationEntity } from './entities/notification.entity';

type ICustomNotification = Notification & {
  user: User;
  actor: User;
  entity: Follower | Posts;
};

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        actorId: userId,
        readed: false,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: true,
        actor: true,
      },
    });

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i] as ICustomNotification;
      switch (notification.entityType) {
        case INotificationEntity.Post:
          const post = await this.prisma.posts.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              user: true,
            },
          });

          notification.entity = post;
          break;

        case INotificationEntity.Follower:
          const followerEntity = await this.prisma.follower.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              actor: true,
              user: true,
            },
          });

          notification.entity = followerEntity;
          break;
      }
    }

    return notifications;
  }
  async getUserReadedNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        actorId: userId,
        readed: true,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: true,
        actor: true,
      },
    });

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i] as ICustomNotification;
      switch (notification.entityType) {
        case INotificationEntity.Post:
          const post = await this.prisma.posts.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              user: true,
            },
          });

          notification.entity = post;
          break;

        case INotificationEntity.Follower:
          const followerEntity = await this.prisma.follower.findFirst({
            where: {
              id: notification.entityId,
            },
            include: {
              actor: true,
              user: true,
            },
          });

          notification.entity = followerEntity;
          break;
      }
    }

    return notifications;
  }

  async markNotificationAsRead(id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id },
    });

    if (notification.readed) {
      return false;
    }

    const update = await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        readed: true,
      },
    });

    if (update) {
      return true;
    }

    return false;
  }

  async markAllNotificationAsRead(user: User) {
    const update = await this.prisma.notification.updateMany({
      where: {
        OR: [
          {
            actorId: user.id,
          },
          {
            userId: user.id,
          },
        ],
      },
      data: {
        readed: true,
      },
    });

    if (update) {
      return true;
    }

    return false;
  }

  async saveFcmToken(userId: number, fcmToken: string) {
    const fcmTokenExists = await this.prisma.fcmNotificationTokens.findFirst({
      where: {
        userId,
      },
    });

    if (!fcmTokenExists) {
      await this.prisma.fcmNotificationTokens.create({
        data: {
          fcmToken,
          userId,
        },
      });

      return true;
    } else {
      await this.prisma.fcmNotificationTokens.update({
        where: {
          userId,
        },
        data: {
          fcmToken,
        },
      });

      return true;
    }
  }

  async editNotificationSettings(
    userId: number,
    settings: EditNotificationSettingsDto,
  ): P<NotificationSettings> {
    return await this.prisma.notificationSettings.update({
      data: settings,
      where: {
        userId,
      },
    });
  }

  async notificationSettings(userId: number): P<NotificationSettings> {
    return await this.prisma.notificationSettings.findUnique({
      where: {
        userId,
      },
    });
  }
}
