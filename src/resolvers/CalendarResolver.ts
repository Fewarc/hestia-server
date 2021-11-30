import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Calendar } from "../models/Calendar";
import { EventParticipants } from "../models/EventParticipants";
import { Event } from "../models/Event";
import { ApolloError } from "apollo-server-express";
import { In } from "typeorm";
import { getCalendarDays } from "../utils/calendarUtils";

@Resolver()
export class CalendarResolver {
  @Mutation(() => Event)
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
    newEvent.eventOccurance = eventOccurance;

    await newEvent.save();

    return newEvent;
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
    const events: Event[] = await Event.find({where: { id: In(userEventsById) }});

    let calendar: Calendar = new Calendar;
    calendar.events = events;
    calendar.calendar = getCalendarDays(year);

    return calendar; 
  }
}