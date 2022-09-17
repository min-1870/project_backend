# COMP1531 Major Project

**✨ 🥜  UNSW Beans 🥜 ✨**

## Contents

[[_TOC_]]

## 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control, continuous integration, and deployment tooling to sustainably integrate code from multiple parties.

## 1. Overview

UNSW's revenue has been going down, despite the absolutely perfect MyExperience feedback.

Realising the bright potential of its students to recreate existing products they pay for, UNSW has tasked me (Hayden), and my army of COMP1531 students with recreating **<a href="https://www.microsoft.com/en-au/microsoft-teams/group-chat-software">Microsoft Teams</a>**.

The 22T3 cohort of COMP1531 students will build the **backend Javascript server** for a new communication platform, **UNSW Beans** (or just **Beans** for short). We plan to task future COMP6080 students to build the frontend for Beans, something you won't have to worry about.

**UNSW Beans** is the questionably-named communication tool that allows you to share, communicate, and collaborate virtually on a bean-like budget.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

UNSW thanks you for doing your part in saving them approximately $100 per student, per year, despite making you pay for this course. 😊

(For legal reasons, this is a joke).

## 2. Iteration 0: Getting Started
### 2.1. Task
This iteration is designed as a warm-up, to help you set up your project, repository, and get to know how your team works together.

In this iteration, you are expected to:
1. Write stub code for the basic functionality of Beans. The basic functionality is defined as the `auth*`, `channel*`, `channels*` capabilities/functions, as per the interface section below (3.2.1).
    * A stub is a function declaration and sample return value (see example below). Do NOT attempt to try and write the implementation for the stubbed functions. That is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 1** function each
    * Function stub locations should be inside files named a matching prefix e.g. `channel*` inside `channel.js`
    * Return values should match the interface table below (see example below)
```javascript
// Sample stub for the authLoginV1 function
// Return stub value matches table below
function authLoginV1(authUserId, email, password) {
  return {
    authUserId: 1,
  }
}
```

2. Fill in the Markdown code block inside `data.md` with a design for the data needed to store information in Beans. Specifically, you need to store information about **users** and **channels**. You should include the population of ONE example user and ONE example channel in your data structure (any values are fine - see example below).
    * Use the input/output examples (3.1.1) and interface table (3.2.1) to help you decide what data might need to be stored.
    * As functions are called, this structure would be populated with more users and channels, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents (see example contents below) .
```javascript
// Example values inside of a 'user' object might look like this
// NOTE: this object's data is not exhaustive,
// - you may need more/fewer fields stored as you complete this project. 
// We won't be marking you down for missing/adding too much sample data in this iteration.
{
  uId: 1,
  nameFirst: 'Hayden',
  nameLast: 'Smith',
  email: 'hayhay123@gmail.com',
  handleStr: 'haydensmith',
}
```


3. Follow best practices for git and teamwork as discussed in lectures.
    * You are expected to have at least 1 meeting with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).
    * For this iteration you will need to make a minimum of **1** merge request for **each person** in your group, into `master`.
    * **1** merge request per function must be made (9 in total)
    * Check out the <a href="https://cgi.cse.unsw.edu.au/~cs1531/redirect/?path=COMP1531/22T3/students/_/lab01_git">Git Basics lab</a> to get familiar with using Git 

### 2.2. Dryrun
We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for this component of iteration 0.

To run the dryrun, you should on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 0
```

### 2.3 Submission
This iteration due date and demonstration week is described in section 4.1.

### 2.4 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>40%</td>
    <td><ul>
      <li>Correct implementation of specified stubs</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing users and channels, inside of data.md</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful and informative git commit names being used</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures)</li>
      <li>At least 1 merge request per person into master made, 1 per function (9 in total)</li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>10%</td>
    <td><ul>
      <li>A generally equal contribution between team members</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section)</li>
    </ul></td>
  </tr>
</table>

## 3. Interface specifications

These interface specifications come from Hayden & COMP6080, who are building the frontend to the requirements set out below.

### 3.1. Input/Output types

#### 3.1.1. Iteration 0+ Input/Output Types
<table>
  <tr>
    <th>Variable name</th>
    <th>Type</th>
  </tr>
  <tr>
    <td>named exactly <b>email</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has suffix <b>id</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>password</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>message</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
</table>

### 3.2. Interface
#### 3.2.1. Iteration 0 Interface
Please note these return values are stubs, requiring no implementaion, and will be replaced in iteration 1. 

<table>
  <tr>
    <th style="width:20%">Function name</th>
    <th style="width:30%">Parameters</th>
    <th style="width:50%">Stub Return Value</th>
  </tr>
  <tr>
    <td><code>authLoginV1</code></td>
    <td><code>( email, password )</code></td>
    <td><code>{ authUserId: 1 }</code></td>
  </tr>
  <tr>
    <td><code>authRegisterV1</code></td>
    <td><code>( email, password, nameFirst, nameLast )</code></td>
    <td><code>{ authUserId: 1 }</code></td>
  </tr>
  <tr>
    <td><code>channelsCreateV1</code></td>
    <td><code>( authUserId, name, isPublic )</code></td>
    <td><code>{ channelId: 1 }</code></td>
  </tr>
  <tr>
    <td><code>channelsListV1</code></td>
    <td><code>( authUserId )</code></td>
<td><pre>{
  channels: [
    {
      channelId: 1,
      name: 'My Channel',
    }
  ],
}</pre></td></tr>
  <tr>
    <td><code>channelsListAllV1</code></td>
    <td><code>( authUserId )</code></td>
<td><pre>{
  channels: [
    {
      channelId: 1,
      name: 'My Channel',
    }
  ],
}</pre></td></tr>
  <tr>
    <td><code>channelDetailsV1</code></td>
    <td><code>( authUserId, channelId )</code></td>
<td><pre>{
  name: 'Hayden',
  ownerMembers: [
    {
      uId: 1,
      email: 'example@gmail.com',
      nameFirst: 'Hayden',
      nameLast: 'Jacobs',
      handleStr: 'haydenjacobs',
    }
  ],
  allMembers: [
    {
      uId: 1,
      email: 'example@gmail.com',
      nameFirst: 'Hayden',
      nameLast: 'Jacobs',
      handleStr: 'haydenjacobs',
    }
  ],
}</pre></td></tr>
  <tr>
    <td><code>channelJoinV1</code></td>
    <td><code>( authUserId, channelId )</code></td>
    <td><code>{}</code></td>
  </tr>
  <tr>
    <td><code>channelInviteV1</code></td>
    <td><code>( authUserId, channelId, uId )</code></td>
    <td><code>{}</code></td>
  </tr>
  <tr>
    <td><code>channelMessagesV1</code></td>
    <td><code>( authUserId, channelId, start )</code></td>
<td><pre>{
  messages: [
    {
      messageId: 1,
      uId: 1,
      message: 'Hello world',
      timeSent: 1582426789,
    }
  ],
  start: 0,
  end: 50,
}</pre></td></tr>
</table>

## 4. Due Dates and Weightings

|Iteration|Due date                              |Demonstration to tutor(s)      |Assessment weighting of project (%)|
|---------|--------------------------------------|-------------------------------|-----------------------------------|
|   0     |10pm Friday 23rd September (**week 2**)    |No demonstration               |5%                                 |
|   1     |10pm Friday 7th October  (**week 4**)   |In YOUR **week 5** laboratory  |30%                                |
|   2     |10pm Friday 28th October (**week 7**)    |In YOUR **week 8** laboratory  |35%                                |
|   3     |10pm Friday 18th November (**week 10**)  |No demonstration               |30%                                |

### 4.1. Submission & Late Penalties

There is no late penalty, as we do not accept late submissions. You will be assessed on the most recent version of your work at the due date and time.

To submit your work, open up a CSE terminal and run:

` $ 1531 submit [iteration] [groupname]`

For example:

` $ 1531 submit iteration0 W11A_EGGS`

Only one person per group needs to run this command. This will submit a copy of your latest git commit to our systems for automarking. 

## 5. Project check-in
During your lab class, you and your team will conduct a short stand-up in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
|Iteration|Week/Check-in|Expected progress|
|---------|-------------|-----------------|
|   0     |**Week 2**   |Bi-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |

## 6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS teams. Make sure you have:
1. Been clear about the issue you feel exists
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 7. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note, you will not be penalized if your work has the potential to be taken without your consent or knowledge.
