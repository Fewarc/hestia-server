import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Calendar } from "../models/Calendar";
import { EventParticipants } from "../models/EventParticipants";
import { Event } from "../models/Event";
import { ApolloError } from "apollo-server-express";
import { In } from "typeorm";
import { getCalendarDays } from "../utils/calendarUtils";
import { User } from "../models/User";

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

      console.log('ITERATION:', index, createdEventDate, eventDate);

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

    console.log('ALL USER EVENTS:', allUserEvents);
    

    return allUserEvents.filter((event: Event) => {
      const eventDate = new Date(event.eventOccuranceDate);

      return (
        year === eventDate.getFullYear() &&
        month === eventDate.getMonth() &&
        day === eventDate.getDate()
      );
    });
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
}