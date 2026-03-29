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

  public type ChatEntry = {
    question : Text;
    answer : [Text];
    timestamp : Time.Time;
  };

  // V1 profile type: kept for stable variable migration (do not remove until next migration cycle)
  type UserProfileV1 = { name : Text };

  public type UserProfile = {
    name : Text;
    role : ?Text;
    experienceLevel : ?Text;
    industry : ?Text;
  };

  let MAX_SUBMISSIONS = 20;
  let MAX_CHATS = 30;

  let userSubmissions = Map.empty<Principal, List.List<Scenario>>();
  // userProfiles: kept with V1 type to safely read existing stable data during migration
  let userProfiles = Map.empty<Principal, UserProfileV1>();
  // userProfilesV2: new map with full UserProfile type (role/experienceLevel/industry)
  let userProfilesV2 = Map.empty<Principal, UserProfile>();
  let userChats = Map.empty<Principal, List.List<ChatEntry>>();

  // Migrate V1 profiles to V2 on upgrade
  system func postupgrade() {
    for ((p, old) in userProfiles.entries()) {
      if (userProfilesV2.get(p) == null) {
        userProfilesV2.add(p, {
          name = old.name;
          role = null;
          experienceLevel = null;
          industry = null;
        });
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfilesV2.get(caller)) {
      case (?p) { ?p };
      case (null) {
        // Fall back to V1 data (name only) for users not yet migrated
        switch (userProfiles.get(caller)) {
          case (?v1) { ?{ name = v1.name; role = null; experienceLevel = null; industry = null } };
          case (null) { null };
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfilesV2.get(user)) {
      case (?p) { ?p };
      case (null) {
        switch (userProfiles.get(user)) {
          case (?v1) { ?{ name = v1.name; role = null; experienceLevel = null; industry = null } };
          case (null) { null };
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfilesV2.add(caller, profile);
  };

  // Cap an array to a maximum number of elements
  func capArray(arr : [Text], maxSize : Nat) : [Text] {
    if (arr.size() <= maxSize) return arr;
    Array.tabulate<Text>(maxSize, func(i) { arr[i] });
  };

  // Build a personalization context intro based on the user's profile
  func getPersonalizationIntro(profile : ?UserProfile) : ?Text {
    switch (profile) {
      case (null) { null };
      case (?p) {
        let hasRole = switch (p.role) { case (?r) { r.size() > 0 }; case (null) { false } };
        let hasExp = switch (p.experienceLevel) { case (?e) { e.size() > 0 }; case (null) { false } };
        let hasInd = switch (p.industry) { case (?i) { i.size() > 0 }; case (null) { false } };
        if (not hasRole and not hasExp and not hasInd) { return null };

        let rolePart = switch (p.role) {
          case (?r) { if (r.size() > 0) r else "professional" };
          case (null) { "professional" };
        };
        let expPart = switch (p.experienceLevel) {
          case (?e) { if (e.size() > 0) e else "" };
          case (null) { "" };
        };
        let indPart = switch (p.industry) {
          case (?i) { if (i.size() > 0) i else "" };
          case (null) { "" };
        };

        let expText = if (expPart.size() > 0) " with " # expPart # " experience" else "";
        let indText = if (indPart.size() > 0) " in the " # indPart # " sector" else "";

        ?("This guidance is tailored for a " # rolePart # expText # indText # ". The insights below account for the typical dynamics, expectations, and stakes that come with your background — use them with that context in mind.");
      };
    };
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

    if (text.contains(#text "gossip") or text.contains(#text "rumour") or text.contains(#text "spreading rumours") or text.contains(#text "rumor") or text.contains(#text "spreading rumors")) {
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

    if (text.contains(#text "job security") or text.contains(#text "redundancy") or text.contains(#text "layoff") or text.contains(#text "laid off") or text.contains(#text "losing my job")) {
      insights := insights.concat([
        "Job security anxiety is one of the most distracting and debilitating feelings in professional life, and the first step is separating what you know from what you fear. If you have received signals about your role — in writing, in conversation, or through changes to your team or responsibilities — take them seriously and respond proactively. If you are operating purely on anxiety and rumour, focus energy on what you can control: your output quality, your relationships, and your visibility.",
        "Regardless of what happens, your primary career asset is your reputation and your network — both of which are fully portable. Use this period to actively maintain relationships outside your current organisation, update your professional profile, and make sure your key achievements are documented. Preparing quietly for transitions is not disloyal — it is prudent and responsible self-management.",
      ]);
    };

    if (text.contains(#text "bully") or text.contains(#text "bullying") or text.contains(#text "intimidat") or text.contains(#text "threatening")) {
      insights := insights.concat([
        "Workplace bullying is serious and you are not obliged to tolerate it. The first priority is your own safety and wellbeing — if you feel genuinely threatened or unsafe, that takes priority over any professional consideration. Start documenting every incident with full detail: date, time, what was said or done, any witnesses. This is your foundation for any formal action.",
        "Report the behaviour through your organisation's formal channels — HR, your skip-level manager, or a designated wellbeing resource. If internal channels are unavailable or have failed, external bodies (employment tribunals, industry regulators) exist for exactly this purpose. Do not allow the desire to avoid conflict to prevent you from protecting yourself.",
      ]);
    };

    if (text.contains(#text "conflict") or text.contains(#text "argument") or text.contains(#text "disagreement") or text.contains(#text "tension")) {
      insights := insights.concat([
        "Workplace conflict is normal, and how you handle it says more about your professional maturity than whether it exists at all. The most important principle is to address it directly, privately, and early — conflict that is left to fester almost always becomes harder to resolve. Choose a neutral, private setting and come with curiosity rather than a predetermined verdict: 'I wanted to speak with you directly because I'd rather address this than let it affect our working relationship.'",
        "When having a conflict conversation, focus on specific observable behaviours and their impact, not character assessments. 'When the deadline was missed without notice, the client presentation was affected' is far more productive than 'you are unreliable.' Your goal is a sustainable working relationship, not winning. Be prepared to hear something that reframes the situation entirely — the other person's perspective may contain information you don't have.",
      ]);
    };

    if (text.contains(#text "communication") or text.contains(#text "not listening") or text.contains(#text "ignored") or text.contains(#text "not heard")) {
      insights := insights.concat([
        "If you feel your voice is not being heard, consider both what you are communicating and how you are communicating it. In many environments, the format matters as much as the content: a well-framed written summary often lands better than a verbal point made in a busy meeting. Find the channel and format that your audience actually reads and responds to, then use it consistently.",
        "Being ignored or dismissed in meetings is a common and frustrating experience. The most effective counter is to build your credibility and relationships outside the room first — when people know and trust your judgment in one-on-one contexts, they are far more likely to receive your ideas in group settings. Seek allies who can amplify your points and give you credit in the room.",
      ]);
    };

    if (text.contains(#text "resign") or text.contains(#text "quit") or text.contains(#text "leave my job") or text.contains(#text "should I leave") or text.contains(#text "new job")) {
      insights := insights.concat([
        "Deciding whether to leave a job is one of the most significant professional decisions you will make, and it deserves a clear-eyed assessment rather than an emotionally reactive one. Before deciding, separate the fixable from the structural: some problems (a difficult manager, a specific project, a workload spike) are temporary or addressable. Others (misaligned values, fundamental cultural toxicity, a role that cannot grow) are structural and no amount of personal effort will change them.",
        "If you decide to move on, leave professionally regardless of how you feel. Your reputation in the industry is long — the people in this organisation will surface again, sometimes in important contexts. Give proper notice, complete handovers thoroughly, and say goodbye with grace. The way you exit is the last data point your current employer will use to assess your character, and it will be mentioned in references.",
      ]);
    };

    if (text.contains(#text "feedback") or text.contains(#text "criticism") or text.contains(#text "critique") or text.contains(#text "negative review")) {
      insights := insights.concat([
        "Receiving difficult feedback is genuinely hard, and your first emotional reaction is almost never your best professional response. When you receive feedback that stings, give yourself a moment — even just a few hours — before deciding how to respond or whether to act on it. Ask yourself: is there any truth in this, even if the delivery was imperfect? The most valuable feedback often arrives in a form that is easy to dismiss.",
        "If feedback feels wrong or unfair, you can push back — but do so by asking questions, not by defending. 'Can you give me a specific example so I can understand better?' is far more effective than 'I disagree with that assessment.' Questions signal engagement and humility. They also force vague or unfair feedback to either substantiate itself or reveal its weakness.",
      ]);
    };

    if (text.contains(#text "salary") or text.contains(#text "pay") or text.contains(#text "raise") or text.contains(#text "underpaid") or text.contains(#text "compensation")) {
      insights := insights.concat([
        "Salary conversations are professional negotiations, not personal favours — approach them with data and confidence. Before the conversation, research market rates for your role, level, and geography using multiple sources. Know your number and the reasoning behind it before you enter the room. Coming with data removes the emotion from the conversation and frames your ask as a market correction, not a demand.",
        "Timing matters in compensation conversations. The strongest moment to negotiate is when you have just delivered a significant result, received positive feedback, or been asked to take on additional scope. Avoid initiating the conversation during a period of organisational stress, budget freezes, or immediately after a challenge. When you make the ask, be direct and specific: 'Based on the market data I've reviewed and the scope of my current role, I believe my compensation should be [specific number].'",
      ]);
    };

    if (text.contains(#text "work life balance") or text.contains(#text "work-life balance") or text.contains(#text "overworked") or text.contains(#text "too many hours") or text.contains(#text "no time for")) {
      insights := insights.concat([
        "Work-life balance is not a perk you are given — it is a boundary you establish and protect. The most important step is to define what sustainable looks like for you specifically, and then communicate it clearly rather than hoping it will be respected automatically. Many overwork situations persist because the individual keeps accepting more without flagging that the load is unsustainable. Naming it is the first and most important act.",
        "When workload is genuinely unmanageable, escalate with specifics: 'I currently have these four priorities and they each require X hours. I want to make sure I'm focused on the right things — can we agree on which of these takes precedence?' This frames the conversation as alignment, not complaint, and gives your manager the information they need to either reprioritise or resource adequately.",
      ]);
    };

    if (text.contains(#text "team lead") or text.contains(#text "leadership") or text.contains(#text "managing people") or text.contains(#text "new manager") or text.contains(#text "first time manager")) {
      insights := insights.concat([
        "Transitioning into a leadership role is one of the most significant professional shifts you will make — the skills that made you successful as an individual contributor are different from, and sometimes in tension with, what makes a great leader. The single most important shift is from doing to enabling: your job is now to make your team capable, not to be the most capable person on the team. This requires patience and deliberate unlearning.",
        "In your first 90 days as a leader, prioritise listening over acting. Have genuine one-on-one conversations with every team member: understand what they are working on, what they find motivating, what they find frustrating, and what they need from you. You will make better decisions with this information than without it, and the act of asking builds trust that will serve you for the rest of your time in that role.",
      ]);
    };

    insights;
  };

  // Free-text coaching: comprehensive keyword routing for any workplace question
  func getFreeChatInsights(text : Text) : [Text] {
    let lowerText = text;
    var insights : [Text] = getKeywordInsights(lowerText);

    if (insights.size() >= 3) {
      return capArray(insights, 7);
    };

    if (lowerText.contains(#text "how do i") or lowerText.contains(#text "how should i") or lowerText.contains(#text "what should i do") or lowerText.contains(#text "advice") or lowerText.contains(#text "help me")) {
      if (lowerText.contains(#text "difficult person") or lowerText.contains(#text "hard to work with") or lowerText.contains(#text "difficult colleague") or lowerText.contains(#text "difficult coworker")) {
        insights := insights.concat([
          "Working with a difficult person requires you to separate the person from the problem. Your goal is not to change who they are — it is to establish a working relationship that functions well enough for both of you to do your jobs. Focus entirely on observable work behaviours and specific outcomes, not character or personality.",
          "The most common mistake with difficult colleagues is either avoidance or escalation — neither resolves the dynamic sustainably. A brief, direct private conversation about a specific behaviour is almost always more effective than either option. Keep the tone professional and forward-looking: 'I wanted to talk about [specific situation] and how we can work better together on this kind of thing.'",
          "If the difficulty is ongoing and a direct conversation has not worked, document the pattern and bring it to your manager as a working-relationship concern, not a personal complaint. Frame it as: 'I'm raising this because I think it's affecting our team's output' — this keeps the focus where it belongs.",
        ]);
      };
    };

    if (lowerText.contains(#text "meeting") or lowerText.contains(#text "presentation") or lowerText.contains(#text "speaking up")) {
      insights := insights.concat([
        "In meetings, your influence is built before you walk in the room. Brief key stakeholders on your ideas one-on-one before the group session — when people have already heard and processed your point, they are far more likely to support it publicly. Walking in without preparation and hoping to be persuasive in real time is the hardest path.",
        "If you struggle to speak up in meetings, use the first three minutes strategically. Making even a brief, constructive comment early — a question, an observation — resets how others perceive your engagement for the rest of the session. Silence in meetings is often read as disinterest or lack of preparation, regardless of the truth.",
      ]);
    };

    if (insights.size() < 3) {
      insights := insights.concat([
        "Start by separating facts from interpretations. What specifically happened or is happening? What did you observe, hear, or receive in writing? Grounding yourself in observable facts before deciding how to respond gives you a significant advantage — it prevents emotional reactions from driving professional decisions, and it means you always have something concrete to refer to.",
        "Before taking any action, consider your goal. Not your immediate emotional goal (to vent, to be right, to be acknowledged) but your actual professional goal: what outcome do you want from this situation? Identifying your real goal often clarifies the path forward immediately — and sometimes reveals that the action you were about to take would have moved you further from it.",
        "Most workplace challenges are conversations that have not happened yet. Identify the one conversation — specific person, specific topic — that would most move the situation forward if it happened well. Then prepare for that conversation: know what you want to say, anticipate the response, and decide on your tone and setting. Prepared conversations rarely go as badly as unprepared ones.",
        "Protect your professional reputation throughout whatever situation you are navigating. How you handle difficulty is what colleagues, managers, and stakeholders remember most. The person who raises a concern constructively, addresses a conflict directly, or exits gracefully is trusted with more and advanced further than the person who handles the same situations reactively or emotionally.",
        "Trust your instincts about when a situation has crossed a line that requires formal action — but also be honest about the difference between a situation that is hard and one that is genuinely wrong. Hard situations (a difficult manager, a frustrating team dynamic, a stalled career) require strategy and self-management. Wrong situations (discrimination, bullying, illegal conduct) require formal documentation and escalation.",
      ]);
    };

    capArray(insights, 7);
  };


  // Returns 2-3 concrete "Try this today" micro-actions, prefixed with "TRY:" for frontend detection
  func getMicroActions(text : Text, who : ?MatrixWho, challengeType : ?MatrixType) : [Text] {
    var actions : [Text] = [];

    // Matrix-specific micro-actions
    switch (who, challengeType) {
      case (?#leaderManager, ?#behaviorActionable) {
        actions := [
          "TRY: Send your manager a brief update today — one paragraph on what you completed, what's next, and any blockers. Do this unprompted.",
          "TRY: Schedule a 15-minute check-in with your manager this week and come with a clear agenda. Owning the structure of that meeting shifts the dynamic.",
          "TRY: Write down one specific boundary or working preference and plan how you will raise it in your next one-on-one.",
        ];
      };
      case (?#peerTeam, ?#behaviorActionable) {
        actions := [
          "TRY: Reach out to the colleague directly today — keep it short and factual: 'I wanted to check in on [specific issue]. Can we talk for 10 minutes?'",
          "TRY: Write down one specific behaviour (not a character judgment) that you want to address. That is your talking point.",
          "TRY: Identify one thing you can stop compensating for silently, and decide what you will do differently starting this week.",
        ];
      };
      case (?#systemOrg, ?#behaviorActionable) {
        actions := [
          "TRY: Write a one-paragraph proposal for the change you want to see — include the problem, the fix, and the benefit to the team or org.",
          "TRY: Identify who owns the process you want to change and schedule a conversation with them this week.",
          "TRY: Find one small win you can implement immediately to build credibility before pushing for the larger change.",
        ];
      };
      case (?#leaderManager, ?#perceptionMindset) {
        actions := [
          "TRY: Send a brief, unprompted update to your manager today — even if nothing is urgent. Consistent visibility reduces dependence on their responsiveness.",
          "TRY: Write down three things you have accomplished in the last two weeks. Keep this list — you will need it.",
          "TRY: Identify one peer or stakeholder outside your direct reporting line you can build a stronger relationship with this month.",
        ];
      };
      case (?#peerTeam, ?#perceptionMindset) {
        actions := [
          "TRY: Identify the one or two colleagues you feel genuinely safe with and invest in those relationships this week.",
          "TRY: The next time you are drawn into a negative conversation, redirect it once with a factual statement and then exit gracefully.",
          "TRY: Write down your honest assessment of whether this environment is fixable — give yourself 15 minutes and be direct with yourself.",
        ];
      };
      case (?#systemOrg, ?#perceptionMindset) {
        actions := [
          "TRY: Identify one genuine opportunity the current change creates for you — even a small one. Write it down.",
          "TRY: Be the first person on your team to publicly engage constructively with the new direction this week.",
          "TRY: If you have a concern, write it down as a specific, constructive proposal and decide who the right person to share it with is.",
        ];
      };
      case (?#leaderManager, ?#careerGrowth) {
        actions := [
          "TRY: Ask your manager directly this week: 'What would I need to consistently demonstrate over the next six months for you to advocate for my promotion?'",
          "TRY: Identify one stretch opportunity — a project, a presentation, a cross-team collaboration — and put your hand up for it.",
          "TRY: Write down your key contributions and outcomes from the last three months. You should always have this ready.",
        ];
      };
      case (?#peerTeam, ?#careerGrowth) {
        actions := [
          "TRY: Volunteer to present your team's work in the next available opportunity — even a brief slot in a team meeting counts.",
          "TRY: Send a genuine, specific message of appreciation to a colleague whose work you have benefited from this week.",
          "TRY: Identify one cross-team project you could contribute to and make a specific offer to help.",
        ];
      };
      case (?#systemOrg, ?#careerGrowth) {
        actions := [
          "TRY: Volunteer for one implementation role in any current org change initiative — it builds cross-functional visibility immediately.",
          "TRY: This week, position yourself publicly as someone who is adapting and contributing to the new direction.",
          "TRY: Ask your manager: 'Where do you see the biggest opportunities for someone like me given the changes happening?'",
        ];
      };
      case (_, _) {
        // Fall through to keyword-based micro-actions below
      };
    };

    // Keyword-based micro-actions (supplement or replace if no matrix match)
    if (actions.size() == 0) {
      if (text.contains(#text "micromanag") or text.contains(#text "micro-manag")) {
        actions := [
          "TRY: Send your manager a brief unprompted update today — what you completed, what's next, any risks. This one act often reduces micromanagement within days.",
          "TRY: Prepare this sentence for your next one-on-one: 'I work best when I have space to execute and then share results — could we agree on a regular check-in rhythm?'",
          "TRY: For one week, respond to every request with a specific timeline. Reliability on small things builds the trust that earns autonomy.",
        ];
      } else if (text.contains(#text "conflict") or text.contains(#text "argument") or text.contains(#text "disagreement")) {
        actions := [
          "TRY: Send a message today requesting a private conversation: 'I'd like to talk about [specific situation] — I'd rather address it directly than let it affect our work.'",
          "TRY: Before that conversation, write down three specific, observable facts — not feelings or interpretations. Those are your talking points.",
          "TRY: Identify what outcome you actually want from this situation. Write it at the top of your preparation notes.",
        ];
      } else if (text.contains(#text "burnout") or text.contains(#text "exhausted") or text.contains(#text "overwhelmed")) {
        actions := [
          "TRY: Block one hour tomorrow morning as protected time — no meetings, no email. Use it for your most important task or for genuine rest.",
          "TRY: Have a conversation with your manager this week: 'I want to flag that I'm close to capacity — can we look at priorities together?'",
          "TRY: Write down three things you will say no to or deprioritise this week. Recovery starts with reducing load, not pushing harder.",
        ];
      } else if (text.contains(#text "promotion") or text.contains(#text "career") or text.contains(#text "growth")) {
        actions := [
          "TRY: Ask your manager this week: 'What would I need to consistently demonstrate to be considered for the next level?'",
          "TRY: Write down your three most significant contributions and outcomes from the past three months. Make this a living document.",
          "TRY: Identify one person at the level above yours and ask them for a 20-minute conversation about their career path.",
        ];
      } else if (text.contains(#text "feedback") or text.contains(#text "criticism")) {
        actions := [
          "TRY: Respond to the feedback you received with one specific question: 'Can you give me an example so I can understand better?'",
          "TRY: Write down the feedback as stated (not your reaction to it) and identify one thing in it that might be useful.",
          "TRY: Ask someone you trust whether they have observed the same thing. An honest second opinion helps you calibrate.",
        ];
      } else if (text.contains(#text "salary") or text.contains(#text "pay") or text.contains(#text "raise") or text.contains(#text "underpaid")) {
        actions := [
          "TRY: Spend 30 minutes today researching market rates for your role and level. Write down your number and the data behind it.",
          "TRY: Prepare this sentence: 'Based on the market data I've reviewed and the scope of my role, I believe my compensation should be [specific number].'",
          "TRY: Identify the one recent result or contribution that best supports your ask. Lead with that when you make the request.",
        ];
      } else {
        actions := [
          "TRY: Identify the one specific conversation that would most move this situation forward — who, what topic, what outcome.",
          "TRY: Write down three facts about the situation (observable, not interpretations) before deciding on your next action.",
          "TRY: Schedule 20 minutes today to prepare for your next important interaction in this situation. Prepared conversations go better.",
        ];
      };
    };

    actions;
  };

  public shared ({ caller }) func submitScenario(text : Text, who : ?MatrixWho, challengeType : ?MatrixType) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit scenarios");
    };

    let timestamp = Time.now();
    let profile = userProfilesV2.get(caller);

    var suggestions : [Text] = [];

    // Prepend personalization intro if profile has role/exp/industry
    switch (getPersonalizationIntro(profile)) {
      case (?intro) { suggestions := [intro] };
      case (null) {};
    };

    switch (who, challengeType) {
      case (?w, ?t) {
        suggestions := suggestions.concat(getIntersectionInsights(w, t));
      };
      case (null, _) {};
      case (_, null) {};
    };

    let keywordInsights = getKeywordInsights(text);
    if (keywordInsights.size() > 0) {
      suggestions := suggestions.concat(keywordInsights);
    };

    suggestions := capArray(suggestions, 9);

    let microActions = getMicroActions(text, who, challengeType);
    let fullResult = suggestions.concat(microActions);

    let scenario : Scenario = {
      text;
      who;
      challengeType;
      timestamp;
      suggestions = fullResult;
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

    fullResult;
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

  // ─── Free Chat ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func submitFreeChat(question : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use the chat");
    };
    if (question.size() == 0) {
      Runtime.trap("Question cannot be empty");
    };

    let profile = userProfilesV2.get(caller);
    var answer = getFreeChatInsights(question);

    // Prepend personalization intro if profile has role/exp/industry
    switch (getPersonalizationIntro(profile)) {
      case (?intro) { answer := [intro].concat(answer) };
      case (null) {};
    };

    answer := capArray(answer, 8);

    let chatMicroActions = getMicroActions(question, null, null);
    let fullAnswer = answer.concat(chatMicroActions);

    let timestamp = Time.now();
    let entry : ChatEntry = { question; answer = fullAnswer; timestamp };

    let chats = switch (userChats.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<ChatEntry>() };
    };

    chats.add(entry);

    while (chats.size() > MAX_CHATS) {
      ignore chats.removeLast();
    };

    userChats.add(caller, chats);

    fullAnswer;
  };

  public query ({ caller }) func getRecentChats() : async [ChatEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve chats");
    };
    switch (userChats.get(caller)) {
      case (?chats) {
        let arr = chats.values().toArray();
        let n = arr.size();
        let take = if (n > 10) 10 else n;
        Array.tabulate<ChatEntry>(take, func(i) { arr[i] });
      };
      case (null) { [] };
    };
  };
};
