import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Calendar } from "../models/Calendar";
import { EventParticipants } from "../models/EventParticipants";
import { Notification } from "../models/Notification";
import { Event } from "../models/Event";
import { ApolloError } from "apollo-server-express";
import { In, Like } from "typeorm";
import { getCalendarDays } from "../utils/calendarUtils";
import { User } from "../models/User";
import Config from "../constants/Config";

@Resolver()
export class CalendarResolver {
  @Mutation(() => [Event])
  async createEvent(
    @Arg('ownerId') ownerId: number,
    @Arg('eventName') eventName: string,
    @Arg('eventDescription') eventDescription: string,
    @Arg('eventOccurance') eventOccurance: Date
  ) {
    let newEvent = Event.create();

    newEvent.ownerId = ownerId;
    newEvent.eventName = eventName;
    newEvent.eventDescription = eventDescription;
    newEvent.eventOccuranceDate = eventOccurance;

    await newEvent.save();

    const createdEventDate = new Date(
      eventOccurance.getFullYear(), 
      eventOccurance.getMonth(), 
      eventOccurance.getDate()
    );

    let events: Event[] = await Event.find();

    return events.filter((event: Event, index) => {
      const eventDate = new Date(
        event.eventOccuranceDate.getFullYear(),
        event.eventOccuranceDate.getMonth(),
        event.eventOccuranceDate.getDate(),
      );

      return createdEventDate === eventDate;
    });
  }

  @Query(() => [Event])
  async getUserEvents(
    @Arg('userId') userId: number,
    @Arg('day') day: number,
    @Arg('month') month: number,
    @Arg('year') year: number,
  ) {
    const userEventsById: number[] = (await EventParticipants.find({ participantId: userId })).map(event => event.eventId);
    const allUserEvents: Event[] = await Event.find({where: [
      { id: In(userEventsById) },
      { ownerId: userId }
    ]});

    const extendedEvents = allUserEvents.filter((event: Event) => {
      const eventDate = new Date(event.eventOccuranceDate);

      return (
        year === eventDate.getFullYear() &&
        month === eventDate.getMonth() &&
        day === eventDate.getDate()
      );
    }).map((event: Event) => ({
      ...event,
      year: new Date(event.eventOccuranceDate).getFullYear(),
      month: new Date(event.eventOccuranceDate).getMonth(),
      day: new Date(event.eventOccuranceDate).getDate()
    }));

    return extendedEvents; 
  }

  @Mutation(() => Event)
  async addUserToEvent(
    @Arg('userId') userId: number,
    @Arg('eventId') eventId: number
  ) {
    const checkParticipation = await EventParticipants.find({ participantId: userId, eventId: eventId });
    if(!!checkParticipation.length) throw new ApolloError('this user is already participating in this event', 'USER_ALREADY_PARTICIPATING')

    let newParticipant = EventParticipants.create();

    newParticipant.eventId = eventId;
    newParticipant.participantId = userId;

    await newParticipant.save()

    const event = await Event.findOne({ id: eventId });

    return event;
  }

  @Query(() => Calendar)
  async getUserCalendar(
    @Arg('userId') userId: number,
    @Arg('year') year?: number
  ) {
    const userEventsById: number[] = (await EventParticipants.find({ participantId: userId })).map(event => event.eventId);
    const events: Event[] = await Event.find({where: [
      { id: In(userEventsById) },
      { ownerId: userId }
    ]});

    const extendedEvents: any[] = events.map(event => ({ 
      ...event, 
      year: new Date(event.eventOccuranceDate).getFullYear(),
      month: new Date(event.eventOccuranceDate).getMonth(),
      day: new Date(event.eventOccuranceDate).getDate()
    }));

    let calendar: Calendar = new Calendar;
    calendar.events = extendedEvents;
    calendar.calendar = getCalendarDays(year);

    return calendar;
  }

  @Query(() => [User])
  async getEventParticipants(
    @Arg('eventId') eventId: number
  ) {
    let participantsById: number[] = (await EventParticipants.find({ eventId: eventId })).map(participant => participant.participantId);
    const event = await Event.findOne({ id: eventId });
    event && participantsById.push(event.ownerId);

    const participants = await User.find({ where: { id: In(participantsById) } });

    return participants;
  }

  @Mutation(() => Boolean)
  async deleteEvent(
    @Arg('eventId') eventId: number
  ) {
    try {
      await Event.delete({ id: eventId });
      await EventParticipants.delete({ eventId: eventId });
      await Notification.delete({ senderId: eventId, content: Like(`%${Config.EVENT_PREFIX}%`) });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing removal request', 'CONTAC_REMOVAL_ERROR');
      return false;
    } finally {
      return true;
    }
  }

  @Mutation(() => Boolean)
  async leaveEvent(
    @Arg('userId') userId: number,
    @Arg('eventId') eventId: number,
  ) {
    try {
      await EventParticipants.delete({ eventId: eventId, participantId: userId });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'NOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
      return true
    }
  }

  @Query(() => [Event])
  async getAllUserEvents(
    @Arg('userId') userId: number
  ) {
    const eventIds = (await EventParticipants.find({ participantId: userId })).map(event => ({ id: event.eventId }));
    return await Event.find({ where: [
      ...eventIds
    ] }); 
  }
}