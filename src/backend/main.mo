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
          "Schedule a private one-on-one conversation to address the issue calmly and without distractions.",
          "Use 'I' statements to express how the situation affects you without assigning blame.",
          "Seek to understand the other person's perspective before responding.",
          "Identify shared goals and use them as common ground for resolution.",
          "If direct conversation doesn't help, consider involving a neutral mediator or HR.",
        ];
      };
      case (#communication) {
        [
          "Confirm mutual understanding by summarising key points at the end of conversations.",
          "Use written follow-ups after important verbal discussions to create a clear record.",
          "Ask clarifying questions rather than making assumptions about intent.",
          "Choose the right channel — some topics need a call or face-to-face, not just a message.",
          "Be concise and specific: state what you need, by when, and why it matters.",
        ];
      };
      case (#escalation) {
        [
          "Attempt to resolve the issue at the lowest level before escalating.",
          "Document all relevant interactions, dates, and outcomes before escalating.",
          "Frame escalation as seeking guidance, not as a complaint, to preserve relationships.",
          "Bring proposed solutions when escalating — don't just present the problem.",
          "Maintain professionalism throughout; avoid emotional language in written communications.",
        ];
      };
      case (#workload) {
        [
          "Prioritise tasks using urgency and importance as your guide — tackle critical items first.",
          "Communicate capacity concerns early with your manager before deadlines are missed.",
          "Identify tasks that can be delegated, deprioritised, or deferred.",
          "Block focused work time on your calendar to protect deep work from interruptions.",
          "Set realistic expectations with stakeholders when workload exceeds capacity.",
        ];
      };
      case (#feedback) {
        [
          "Give feedback promptly and in private when it relates to an individual's behaviour.",
          "Focus on specific, observable actions rather than personality or character.",
          "Balance constructive feedback with genuine recognition of what's working well.",
          "When receiving feedback, listen fully before responding — avoid getting defensive.",
          "Follow up after feedback conversations to acknowledge progress and maintain trust.",
        ];
      };
      case (#general) {
        [
          "Reflect on the situation objectively and consider perspectives beyond your own.",
          "Approach the challenge as a problem to solve collaboratively, not a battle to win.",
          "Seek advice from a trusted mentor or colleague who has handled similar situations.",
          "Document what happened and what steps you've taken in case you need a record later.",
          "Focus on what you can control and act with professionalism regardless of others' behaviour.",
        ];
      };
    };
  };

  func analyzeTextForKeywords(text : Text, category : ?Category) : [Text] {
    var suggestions : [Text] = [];

    // Add category-specific suggestions
    switch (category) {
      case (?cat) {
        suggestions := suggestions.concat(getCategorySuggestions(cat));
      };
      case (null) {};
    };

    // Add keyword-specific suggestions
    if (text.contains(#text "deadline") or text.contains(#text "overworked") or text.contains(#text "overwhelmed")) {
      suggestions := suggestions.concat([
        "Manage expectations by communicating your current capacity to your manager.",
        "Prioritise tasks based on urgency and business impact.",
        "Consider discussing workload redistribution with your team or supervisor.",
      ]);
    };

    if (text.contains(#text "misunderstanding") or text.contains(#text "clarify") or text.contains(#text "unclear")) {
      suggestions := suggestions.concat([
        "Confirm understanding after important conversations with a written summary.",
        "Ask clarifying questions early to avoid assumptions building up.",
        "Request a brief meeting to align on expectations and next steps.",
      ]);
    };

    if (text.contains(#text "disagree") or text.contains(#text "conflict") or text.contains(#text "argument")) {
      suggestions := suggestions.concat([
        "Focus on the issue and facts rather than the person involved.",
        "Seek to understand the other perspective fully before sharing your own.",
        "Find areas of agreement to build a foundation for resolving the disagreement.",
      ]);
    };

    if (text.contains(#text "manager") or text.contains(#text "boss") or text.contains(#text "supervisor")) {
      suggestions := suggestions.concat([
        "Request a one-on-one meeting to discuss concerns directly and professionally.",
        "Prepare specific examples and desired outcomes before the conversation.",
        "Frame the discussion around shared goals and team success.",
      ]);
    };

    if (text.contains(#text "colleague") or text.contains(#text "coworker") or text.contains(#text "team")) {
      suggestions := suggestions.concat([
        "Address concerns privately with the colleague before involving others.",
        "Look for ways to collaborate rather than compete — shared wins build trust.",
        "If team dynamics are the issue, a facilitated team retrospective may help.",
      ]);
    };

    // Always ensure at least 4 general suggestions are returned
    if (suggestions.size() == 0) {
      suggestions := [
        "Reflect on the situation from multiple perspectives before deciding how to act.",
        "Document key facts, dates, and interactions while they are fresh.",
        "Choose a calm, private setting to address the issue with the relevant person.",
        "Focus on what outcome you want and prepare specific, constructive points to raise.",
        "Seek advice from a trusted mentor or HR if you are unsure how to proceed.",
      ];
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
