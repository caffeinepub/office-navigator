import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type MatrixWho = {
    #leaderManager;
    #peerTeam;
    #systemOrg;
  };

  public type MatrixType = {
    #behaviorActionable;
    #perceptionMindset;
    #careerGrowth;
  };

  public type Scenario = {
    text : Text;
    who : ?MatrixWho;
    challengeType : ?MatrixType;
    timestamp : Time.Time;
    suggestions : [Text];
  };

  public type UserProfile = {
    name : Text;
    // Add more user-specific metadata as needed
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

  // Cap an array to a maximum number of elements
  func capArray(arr : [Text], maxSize : Nat) : [Text] {
    if (arr.size() <= maxSize) return arr;
    Array.tabulate<Text>(maxSize, func(i) { arr[i] });
  };

  func getIntersectionInsights(who : MatrixWho, challengeType : MatrixType) : [Text] {
    switch (who, challengeType) {
      case (#leaderManager, #behaviorActionable) {
        [
          "Share progress proactively to reduce manager anxiety",
          "Have direct conversation about working style preferences",
          "Propose a clear check-in rhythm as an alternative to hovering",
          "Build trust through small, consistent delivery on promises",
          "Keep a record of your output and decisions for credibility",
          "Understand the manager's underlying fear — performance risk, their own pressure",
          "Do not resist visibility; redirect it into structured updates you control",
          "Know when micromanagement is actually a mismatch in role clarity, not control",
        ];
      };
      case (#peerTeam, #behaviorActionable) {
        [
          "Offer genuine help before drawing conclusions about motivation",
          "Have a private, non-judgmental conversation to clarify roles and blockers",
          "Focus on shared outcomes — what does the team need?",
          "Do not compensate silently — it breeds resentment and removes accountability",
          "Raise it with your manager using facts, not frustration",
          "Protect your own output while being constructively supportive",
          "Let the accountability belong to the right person — manager, not you",
        ];
      };
      case (#systemOrg, #behaviorActionable) {
        [
          "Identify the specific lever or root cause before proposing anything",
          "Propose solutions with measurable upside — not just complaints",
          "Map who owns the process and route your proposal there",
          "Frame improvements as serving the org's goals, not your convenience",
          "Build small wins first to establish credibility on systemic change",
          "Use data to show cost of status quo",
          "Expect resistance and prepare responses to the top 3 objections",
        ];
      };
      case (#leaderManager, #perceptionMindset) {
        [
          "Distinguish between unavailable and uninterested — context matters",
          "Focus energy on what you can control: your output, your visibility, your relationships",
          "Use written communication to create a record and reduce dependence on verbal responses",
          "Proactively manage upward — brief your manager, don't wait to be briefed",
          "Build lateral relationships so you are not solely dependent on one person",
          "Recognize when unresponsiveness is a message — and decide what to do with that information",
          "Protect your work quality regardless of managerial engagement",
        ];
      };
      case (#peerTeam, #perceptionMindset) {
        [
          "Identify what you can and cannot change before spending energy on either",
          "Protect your mindset rigorously — limit exposure to toxicity without disengaging from work",
          "Steer conversations toward professional topics and disengage from negativity without drama",
          "Build a small circle of psychologically safe colleagues",
          "Distinguish between cultural discomfort and genuine misconduct — both matter but differently",
          "Have an honest exit calculus: what is the cost of staying vs. leaving?",
          "Do not allow the culture to normalize unacceptable behavior in your own mind",
        ];
      };
      case (#systemOrg, #perceptionMindset) {
        [
          "Accept that resistance to change is usually about loss, not logic — understand what people fear losing",
          "Learn the new system or policy thoroughly before judging it",
          "Find the genuine opportunities embedded in the change",
          "Be the person who adapts visibly and constructively — it is career-positive",
          "Raise concerns through proper channels with specific, constructive framing",
          "Avoid being the voice of resistance in public settings — it limits your influence",
          "Build resilience as a career skill: organizations change constantly",
        ];
      };
      case (#leaderManager, #careerGrowth) {
        [
          "Have an explicit conversation about your ambitions and the path forward",
          "Ask what you need to demonstrate to be considered for the next level",
          "Seek stretch assignments that expand your visibility and scope",
          "Identify and close the specific gaps your manager sees",
          "Build your reputation with stakeholders beyond your direct manager",
          "Do not wait to be noticed — professional visibility is your responsibility",
          "Consider whether this manager or organization can actually offer what you need",
        ];
      };
      case (#peerTeam, #careerGrowth) {
        [
          "Track your results explicitly and make them visible in the right contexts",
          "Mentor or support others — being known as someone who develops people is powerful",
          "Volunteer for cross-team projects where you can build a wider reputation",
          "Present your own work rather than letting others represent it",
          "Build genuine reciprocal relationships — not just networking for gain",
          "Celebrate others' wins visibly — it builds social capital and is the right thing to do",
          "Recognize that being unnoticed is often a visibility problem, not a value problem",
        ];
      };
      case (#systemOrg, #careerGrowth) {
        [
          "Read every new policy with a lens of: where is the opportunity here for me?",
          "Adapt early and publicly — early adopters of org change gain credibility",
          "Ask questions about how you can contribute to the new direction",
          "Position yourself as part of the solution, not part of the resistance",
          "Use change periods to volunteer for implementation roles — they build cross-functional visibility",
          "Stay informed about the strategic rationale — context helps you adapt intelligently",
          "If a new policy genuinely conflicts with your values, evaluate that honestly and decide",
        ];
      };
    };
  };

  func getKeywordInsights(text : Text) : [Text] {
    var insights : [Text] = [];

    if (text.contains(#text "micromanag") or text.contains(#text "micro-manag") or text.contains(#text "looking over my shoulder") or text.contains(#text "watching my every")) {
      insights := insights.concat([
        "Micromanagement usually comes from anxiety, not malice — your manager is worried about outcomes, and their solution is control. The most effective response is to remove the anxiety by over-communicating proactively: give regular, brief updates before they ask, share your plan for the week, flag risks early. When managers feel informed, the urge to micromanage often reduces naturally within weeks.",
        "Have a direct but constructive conversation about working style: 'I work best when I have the space to execute and then bring you results — could we agree on a check-in rhythm that works for both of us?' This frames autonomy as a productivity request rather than a complaint, and gives your manager a concrete alternative to hovering. Come with a specific proposal — 'a weekly update every Monday' — rather than a vague request for space.",
      ]);
    };

    if (text.contains(#text "took credit") or text.contains(#text "stole my idea") or text.contains(#text "my idea") or text.contains(#text "not acknowledged")) {
      insights := insights.concat([
        "Having your work or ideas go uncredited is one of the most demoralising workplace experiences, and it is worth addressing — but strategically. The most durable solution is to build visibility proactively: send brief summary emails after key meetings ('as discussed, my recommendation is...'), present your own work wherever possible, and create a paper trail that makes it clear where ideas originate. Prevention is far more effective than confrontation after the fact.",
        "If credit has already been taken, address it privately and early with the person concerned: 'I noticed [specific example] was attributed to you — I want to make sure we're aligned on how we represent our work together going forward.' This is firm without being accusatory. If it happens again, involve your manager with specific documented examples. But choose your battles carefully — fighting every small instance of under-attribution can cost you more in relationships than it gains in recognition.",
      ]);
    };

    if (text.contains(#text "gaslight") or text.contains(#text "denying what happened") or text.contains(#text "never said that") or text.contains(#text "you are imagining")) {
      insights := insights.concat([
        "If you are consistently finding that your recollection of events is being contradicted — especially by someone with authority over you — trust your instincts, but verify them too. Begin keeping a very specific, timestamped private log of conversations and incidents: what was said, by whom, in what context. This serves two purposes: it anchors your reality against confusion, and it creates a record if you need to escalate. Do this quietly and consistently.",
        "Gaslighting in the workplace is a form of psychological manipulation and it is serious. Do not try to convince the person that your version is correct — that conversation rarely ends well when someone is deliberately or unconsciously distorting reality. Instead, focus your energy on trusted witnesses who can corroborate your experience, build your documentation, and if the pattern continues, involve HR or a senior leader framing it as a concern about communication and trust.",
      ]);
    };

    if (text.contains(#text "toxic") or text.contains(#text "hostile environment") or text.contains(#text "unhealthy culture")) {
      insights := insights.concat([
        "Working in a toxic environment has real and serious effects on mental health, physical health, and career trajectory. The first honest question to ask yourself is: is this a fixable situation or a structural one? Individual bad actors can sometimes be managed around or escalated. But if toxicity is embedded in the culture, rewarded by leadership, or systemic — that is not something you can fix by adapting. Clarity on this distinction will save you enormous energy.",
        "While you are in a difficult environment, protect your wellbeing rigorously: maintain boundaries around your time and emotional energy, keep a strong network outside the organisation, and document everything. Do not let the environment normalise behaviour that would be considered unacceptable elsewhere — your internal compass about what is acceptable matters. Preparing your exit quietly while remaining professional in the present is a completely legitimate strategy.",
      ]);
    };

    if (text.contains(#text "passive aggressive") or text.contains(#text "passive-aggressive") or text.contains(#text "snide comment") or text.contains(#text "backhanded")) {
      insights := insights.concat([
        "Passive-aggressive behaviour is indirect conflict, and the worst response is to match it. Do not react to the subtext — respond only to the surface text, literally and professionally. If someone makes a snide comment, ask them calmly and directly: 'I want to make sure I'm understanding you correctly — can you tell me what you mean by that?' This forces the subtext into the open in a way that cannot be denied.",
        "Name the pattern privately when you address it directly with the person: 'I've noticed a few interactions recently that felt a bit off to me, and I'd rather deal with things directly than let them build. Is there something on your mind about how we're working together?' Most passive-aggressive behaviour comes from someone who doesn't feel safe raising a concern directly. Creating that opening often resolves the dynamic entirely.",
      ]);
    };

    if (text.contains(#text "gossip") or text.contains(#text "rumour") or text.contains(#text "spreading rumours")) {
      insights := insights.concat([
        "Workplace gossip is corrosive and your best protection against it is a reputation built on consistent behaviour over time. In the short term, do not engage with or amplify rumours about others — it will come back to you. If you hear something being said about you, address it directly with the source if you can identify them: 'I've heard some things being said and I'd like to address them directly with you.' Silence in the face of known rumours is often read as confirmation.",
      ]);
    };

    if (text.contains(#text "promotion") or text.contains(#text "promoted") or text.contains(#text "career growth") or text.contains(#text "not recognised") or text.contains(#text "not recognized")) {
      insights := insights.concat([
        "If you feel your contributions are not being recognised or your career progression is stalling, the first step is a direct, honest conversation with your manager about your ambitions and what the path forward looks like. Many people wait to be noticed; the professionals who advance fastest are those who have explicit conversations about what they want and what they need to demonstrate to get there. Ask directly: 'What would I need to consistently demonstrate over the next six months for you to advocate for me for the next level?'",
        "Make your work visible without being self-promotional in a way that feels uncomfortable. The practical version of this is: brief updates on progress to relevant stakeholders, being the person who presents outcomes in meetings, and building relationships with people one level above you. Visibility is not vanity — it is a professional responsibility, because the people who make decisions about your career cannot advocate for work they don't know exists.",
      ]);
    };

    if (text.contains(#text "performance review") or text.contains(#text "performance rating") or text.contains(#text "performance improvement plan") or text.contains(#text "annual review")) {
      insights := insights.concat([
        "Performance review conversations are high-stakes and require preparation. Before the meeting, write down your key contributions with specific outcomes, the challenges you navigated, and what you learned. Come with your own assessment of your performance — not to argue, but to ensure the conversation is a genuine dialogue rather than a one-way evaluation. Managers who see that you can assess your own work honestly are far more likely to trust your judgment in general.",
        "If you receive a rating or feedback that surprises or disappoints you, resist the impulse to argue in the moment. Ask: 'Can you walk me through what specifically led to this assessment?' and 'What would I need to do differently to achieve the outcome I'm aiming for next cycle?' These questions move you from defensiveness to forward momentum.",
      ]);
    };

    if (text.contains(#text "burnout") or text.contains(#text "burnt out") or text.contains(#text "breaking point") or text.contains(#text "exhausted")) {
      insights := insights.concat([
        "Burnout is not a productivity problem — it is a physiological and psychological state that requires real recovery, not just a weekend off. If you are genuinely at or near burnout, the most important thing you can do is acknowledge it honestly to yourself first. The professional impulse to push through is understandable but dangerous at this stage. Recovering from severe burnout takes months, not days — acting early is significantly better than collapsing later.",
        "Have a frank conversation with your manager or HR about your situation. You do not need to dramatise it — simply be honest: 'I want to flag that I am close to capacity and I want to address that proactively so my work doesn't suffer.' Most organisations would far rather receive this conversation than deal with a crisis, a medical absence, or a resignation. You are not being weak by raising this — you are exercising exactly the kind of self-awareness that good professionals are expected to have.",
      ]);
    };

    if (text.contains(#text "unfair treatment") or text.contains(#text "discrimination") or text.contains(#text "treated differently") or text.contains(#text "bias")) {
      insights := insights.concat([
        "If you believe you are being treated unfairly or discriminated against, documentation is your most important asset. Keep a specific, dated record of every incident: who was involved, what was said or done, who witnessed it. Be precise and factual — avoid emotive language in your notes. When you have a clear pattern documented, you have something concrete to bring to HR, a senior leader, or if necessary, an employment rights advisor.",
        "Raising a formal concern about unfair treatment is a serious step and one you are fully entitled to take. Before you do, understand the process in your organisation and what protections exist for you. Consider speaking to HR informally first to understand your options. You should not have to simply accept treatment that violates your organisation's stated values or legal employment standards.",
      ]);
    };

    if (text.contains(#text "job security") or text.contains(#text "redundancy") or text.contains(#text "layoff") or text.contains(#text "losing my job") or text.contains(#text "restructuring")) {
      insights := insights.concat([
        "When job security feels uncertain, the most constructive thing you can do is take action rather than wait in anxiety. Update your CV now, reconnect with your professional network, and make your current contributions as visible and valuable as possible. People who are proactive during uncertain periods protect themselves regardless of outcome — they either demonstrate enough value to survive a cut, or they are prepared to move quickly if they don't.",
        "If you have the opportunity, have a direct conversation with your manager about your position and role: 'I want to understand how you see my role in the current environment and what I should be focusing on to add the most value.' This is not a sign of insecurity — it is mature professional communication, and it gives your manager an opportunity to tell you things that are better said openly than left to rumour.",
      ]);
    };

    if (text.contains(#text "bullying") or text.contains(#text "bully") or text.contains(#text "abusive manager") or text.contains(#text "toxic boss")) {
      insights := insights.concat([
        "Managing up when your direct manager is difficult requires a clear strategy. First, separate the behaviours you can work around from those that genuinely cross a line — such as public humiliation, threats, or deliberate sabotage. The former require adaptation and resilience; the latter require documentation and escalation. Mixing them up leads to either under-reacting to serious misconduct or over-escalating manageable friction.",
        "If your manager's behaviour is affecting your wellbeing or your ability to do your job, you have every right to raise it with HR or their manager. Frame it as a professional concern: 'I want to raise a pattern of behaviour that I have been experiencing and that I believe is affecting team performance.' Bring specific, documented examples. Your concern is more likely to be taken seriously when it is grounded in facts and patterns rather than a single incident.",
      ]);
    };

    if (text.contains(#text "deadline") or text.contains(#text "overworked") or text.contains(#text "overwhelmed") or text.contains(#text "too much work")) {
      insights := insights.concat([
        "When you are facing an impossible deadline or are overwhelmed by volume, the first step is triage — not panic. List everything you are responsible for, estimate how long each will genuinely take, and identify which items have hard vs. soft deadlines. Once you have that picture, you can have a meaningful conversation with your manager about trade-offs rather than a vague plea for help. Specificity transforms the conversation.",
      ]);
    };

    if (text.contains(#text "not listened to") or text.contains(#text "being ignored") or text.contains(#text "not being heard") or text.contains(#text "dismissed by")) {
      insights := insights.concat([
        "Feeling consistently unheard or dismissed is demoralising, and the response needs to be both tactical and strategic. Tactically: prepare more thoroughly before meetings, put your key point in writing beforehand, and follow up verbally with a written summary. Strategically: build your credibility and relationships so that when you speak, there is already an established basis for people to take you seriously. Being heard is partly about timing and partly about reputation — both can be built deliberately.",
      ]);
    };

    insights;
  };

  public shared ({ caller }) func submitScenario(
    text : Text,
    who : ?MatrixWho,
    challengeType : ?MatrixType,
  ) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit scenarios");
    };

    let timestamp = Time.now();

    var suggestions : [Text] = [];

    switch (who, challengeType) {
      case (?w, ?t) {
        suggestions := suggestions.concat(getIntersectionInsights(w, t));
      };
      case (null, _) {};
      case (_, null) {};
    };

    let keywordInsights = getKeywordInsights(text);
    if (keywordInsights.size() > 0) {
      suggestions := keywordInsights.concat(suggestions);
    };

    suggestions := capArray(suggestions, 8);

    let scenario : Scenario = {
      text;
      who;
      challengeType;
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
