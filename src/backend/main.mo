import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";

actor {
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

  let MAX_SUBMISSIONS = 20;
  let submissions = List.empty<Scenario>();

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
    let timestamp = Time.now();
    let suggestions = analyzeTextForKeywords(text, category);

    let scenario : Scenario = {
      text;
      category;
      timestamp;
      suggestions;
    };

    submissions.add(scenario);

    while (submissions.size() > MAX_SUBMISSIONS) {
      ignore submissions.removeLast();
    };

    suggestions;
  };

  public query ({ caller }) func getRecentSubmissions() : async [Scenario] {
    submissions.values().toArray();
  };
};
