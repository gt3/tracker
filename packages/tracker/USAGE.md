# 1. User Identification

To gain insight into user behavior, it is critical to identify unique users and track their activity. Amplitude uses a combination of implicit and explicit mechanisms to identify users. 

| Property | Usage  | 
|----------|--------|
| Device Id | - auto-generated uuid<br>- stored in browser's cookie<br>- override to track user across different domains<br> |
| User Id | - supplied once user logs in<br>- not set for anonymous users |
| Amplitude Id | - computed from device id and user id<br> - unique identifier for reporting purposes |


## 1.1 Anonymous Users
Users that cannot be identified uniquely by the User Id property are tracked implicitly using the Device Id and Amplitude Id. Activity of an anonymous user is retained and is automatically associated to a provided User Id once that user logs in.

## 1.2 Cross-Domain Tracking of Anonymous Users

The Device Id plays an important role in identifying and tracking activity from an anonymous user, irrespective of the visited sites.

To track a user across domain boundaries (e.g. a.csod.com/foo => b.csod.com/foo), the same Device Id should be supplied during sdk initialization. This overrides default initialization behavior by computing the Amplitude Id from the provided Device Id.

## 1.3 Cross-Domain Tracking of Authenticated Users

When a user with the same User Id navigates to a different site, the Device Id _might_ change but the Amplitude Id will remain the same. This guarantees accurate cross-domain tracking of authenticated users.

## 1.4 Complex Authentication Scenarios

Please refer to [Merged Users](https://amplitude.zendesk.com/hc/en-us/articles/115003135607#merged-users) and [Example Scenarios](https://amplitude.zendesk.com/hc/en-us/articles/115003135607#example-scenarios) for a complete understanding of the user tracking mechanism.


<br>

# 2. User Properties

It can be helpful to record certain pieces of data that define the user especially when that information can change over time.

Example of user properties: age, gender, locale, ou, etc.

It is possible to update a user's properties within the payload of the event itself. Once the user's properties are set, future events will reference the updated information.

References:
- [User Property Definitions](https://amplitude.zendesk.com/hc/en-us/articles/215562387-Appendix-Amplitude-User-Property-Definitions)
- [Identify API](https://amplitude.zendesk.com/hc/en-us/articles/205406617)

<br>

# 3. Event Properties

For analytics, Events are a way to track meaningful actions at a given time. Events can be triggered by a user action (e.g. form submit) or a system event (e.g. page load).

Event Properties are attributes that describe the Event. Events can also be grouped by passing the grouping information in Event Properties. This will help in lowering the total number of events.
