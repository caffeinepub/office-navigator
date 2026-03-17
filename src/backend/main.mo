import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Category = {
    #conflict;
    #communication;
    #escalation;
    #workload;
    #feedback;
    #general;
  };

  type Scenario = {
    text : Text;
    category : ?Category;
    timestamp : Time.Time;
    suggestions : [Text];
  };

  public type UserProfile = {
    name : Text;
  };

  let MAX_SUBMISSIONS = 20;

  let userSubmissions = Map.empty<Principal, List.List<Scenario>>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getCategorySuggestions(category : Category) : [Text] {
    switch (category) {
      case (#conflict) {
        [
          "Approach with empathy and understanding.",
          "Seek common ground and shared goals.",
          "Express concerns respectfully.",
          "Listen actively to the other party.",
        ];
      };
      case (#communication) {
        [
          "Ensure clarity in your message.",
          "Use precise language.",
          "Confirm understanding with follow-up questions.",
          "Be open to feedback.",
        ];
      };
      case (#escalation) {
        [
          "Attempt to resolve issues at the lowest level first.",
          "Escalate only when necessary.",
          "Document all relevant interactions.",
          "Maintain professionalism throughout the process.",
        ];
      };
      case (#workload) {
        [
          "Prioritize urgent tasks.",
          "Delegate where possible.",
          "Communicate workload concerns early.",
          "Take breaks to maintain productivity.",
        ];
      };
      case (#feedback) {
        [
          "Give feedback constructively.",
          "Focus on specific behaviors, not individuals.",
          "Be open to receiving feedback yourself.",
          "Express appreciation for positive contributions.",
        ];
      };
      case (#general) {
        [
          "Maintain a positive attitude.",
          "Build strong professional relationships.",
          "Seek opportunities for growth.",
          "Adapt to changes with resilience.",
        ];
      };
    };
  };

  func analyzeTextForKeywords(text : Text, category : ?Category) : [Text] {
    var suggestions : [Text] = [];
    switch (category) {
      case (?cat) {
        suggestions := suggestions.concat(getCategorySuggestions(cat));
      };
      case (null) {};
    };

    if (text.contains(#text "deadline") or text.contains(#text "overworked")) {
      suggestions := suggestions.concat([
        "Manage expectations realistically.",
        "Prioritize tasks based on urgency and importance.",
        "Consider discussing workload with your supervisor.",
      ]);
    };

    if (text.contains(#text "misunderstanding") or text.contains(#text "clarify")) {
      suggestions := suggestions.concat([
        "Confirm understanding after conversations.",
        "Summarize key points in writing.",
        "Ask clarifying questions.",
      ]);
    };

    if (text.contains(#text "disagree") or text.contains(#text "conflict")) {
      suggestions := suggestions.concat([
        "Focus on the issue, not the person.",
        "Seek to understand the other perspective.",
        "Find common ground for agreement.",
      ]);
    };

    suggestions;
  };

  public shared ({ caller }) func submitScenario(text : Text, category : ?Category) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit scenarios");
    };

    let timestamp = Time.now();
    let suggestions = analyzeTextForKeywords(text, category);

    let scenario : Scenario = {
      text;
      category;
      timestamp;
      suggestions;
    };

    let submissions = switch (userSubmissions.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Scenario>() };
    };

    submissions.add(scenario);

    while (submissions.size() > MAX_SUBMISSIONS) {
      ignore submissions.removeLast();
    };

    userSubmissions.add(caller, submissions);

    suggestions;
  };

  public query ({ caller }) func getRecentSubmissions() : async [Scenario] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve submissions");
    };
    switch (userSubmissions.get(caller)) {
      case (?submissions) { submissions.values().toArray() };
      case (null) { [] };
    };
  };
};
