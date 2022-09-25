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
Now complete!
## 3. Iteration 1: Basic Functionality and Tests

[Watch the iteration 1 introductory video here.](https://youtu.be/_pLMyzA5sKA)
Please note that this video was recorded in 22T2. You should consult this spec for minor changes.
### 3.1. Task

In this iteration, you are expected to:

1. Write tests for and implement the basic functionality of Beans. The basic functionality is defined as the `auth*`, `channel*`, `channels*`, `users*`, `other*` capabilities/functions, as per the interface section below.
    * Test files you add should all be in the form `*.test.js`.
    * Do NOT attempt to try and write or start a web server. Don't overthink how these functions are meant to connect to a frontend yet. That is for the next iteration. In this iteration you are just focusing on the basic backend functionality.

2. Write down any assumptions that you feel you are making in your interpretation of the specification.
    * The `assumptions.md` file described above should be in the root of your repository. If you've not written markdown before (we assume most of you haven't), it's not necessary to research the format. Markdown is essentially plain text with a few extra features for basic formatting. You can just stick with plain text if you find that easier.
    * We will only be marking the quality of SIX of your assumptions. You can indicate which ones you would like marked, otherwise we will look at the first six.

3. Follow best practices for git, project management, and effective teamwork, as discussed in lectures.
    * The marking will be heavily biased toward how well you follow good practices and work together as a team. Just having a "working" solution at the end is not, on its own, sufficient to even get a passing mark.

    * You need to use the **GitLab Issue Boards** for your task tracking and allocation. Spend some time getting to know how to use the taskboard. If you would like to use another collaborative task tracker e.g. Jira, Trello, Airtable, etc. you must first get approval from your tutor and grant them administrator access to your team board.

    * You are expected to meet regularly with your group and document the meetings via meeting minutes, which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).

    * You should have regular standups and be able to demonstrate evidence of this to your tutor.

    * For this iteration, you will need to collectively make a minimum of **12** merge requests into `master`.

### 3.2. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
2. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
3. Implement that feature.
4. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
5. Consider any assumptions you made in the previous steps and add them to `assumptions.md`.
6. Create a merge request for the branch.
7. Get someone in your team who **did not** work on the feature to review the merge request.
8. Fix any issues identified in the review.
9. Merge the merge request into master.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.js`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature is implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing the implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* Merging in merge requests with failing tests is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development, it is something you will be penalised for in marking.
* Similarly, merging in branches with untested features is also **very bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 3.3. File structure and stub code

The tests you write should be as small and independent as possible. This makes it easier to identify why a particular test may be failing. Similarly, try to make it clear what each test is testing for. Meaningful test names and documentation help with this. An example of how to structure tests has been done in:

* `src/echo.js`
* `src/echo.test.js`

The echo functionality is tested, both for correct behaviour and for failing behaviour. As echo is relatively simple functionality, only 2 tests are required. For the larger features, you will need many tests to account for many different behaviours.

The files from iteration 0 should be developed with actual implementations, in addition to the new `other.js` and `users.js` files:
 * `auth.js`
 * `channel.js`
 * `channels.js`
 * `users.js`
 * `other.js`

### 3.4. Authorisation

Elements of securely storing passwords and other tricky authorisation methods are not required for iteration 1. You can simply store passwords plainly, and use the user ID to identify each user. We will discuss ways to improve the quality and methods of these capabilities in the later iterations.

Note that the `authUserId` variable is simply the user ID of the user who is making the function call. For example,
* A user registers an account with UNSW Beans and is assigned some integer ID, e.g. `42` as their user ID.
* When they make subsequent calls to functions, their user ID - in this case, `42` - is passed in as the `authUserId` argument.

Since `authUserId` refers to the user ID of the user calling the functions, you do NOT need to store separate user IDs (e.g. a uId or userId + a authUserId) to identify each user in your data structure - you only need to store one user ID. How you name this user ID property in your data structure is up to you.

### 3.5. Test writing guidelines

To test basic functionality you will likely need code like:

```javascript
let result = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella')
authLoginV1('validemail@gmail.com', '123abc!@#') // Expect to work since we registered
```

However, when deciding how to structure your tests, keep in mind the following:

* Your tests should be *black box* unit tests.
  * Black box means they should not depend your specific implementation, but rather work with *any* working implementation. You should design your tests such that if they were run against another group's backend they would still pass.
  * For iteration 1, you should *not* be importing the `data` object itself or directly accessing it via the `get` or `set` functions from `src/dataStore.js` inside your tests.
  * Unit tests mean the tests focus on testing particular functions, rather than the system as a whole. Certain unit tests will depend on other tests succeeding. It's OK to write tests that are only a valid test if other functions are correct (e.g. to test `channel` functions you can assume that `auth` is implemented correctly).

* Avoid writing your tests such that they need to be run in a particular order. That can make it hard to identify what exactly is failing.

* You should reset the state of the application (e.g. deleting all users, channels, messages, etc.) at the start of every test. That way you know none of them are accidentally dependent on an earlier test. You can use a function for this that is run at the beginning of each test (hint: `clearV1`).

* If you find yourself needing similar code at the start of a series of tests, consider using Jest's **beforeEach** to avoid repetition.

### 3.6. Storing data

Nearly all of the functions will likely have to reference some "data source" to store information. E.G. If you register two users, create two channels, and then add a user to a channel, all of that information needs to be "stored" somewhere. The most important thing for iteration 1 is not to overthink this problem.

Firstly, you should **not** use an SQL database, or something like firebase.

Secondly, you don't need to make anything persist. What that means is that if you run all your tests, and then run them again later, it's OK for the data to be "fresh" each time you run the tests. We will cover persistence in another iteration.

Inside `src/dataStore.js` we have provided you with an object called `data` which will contain the information that you will need to access across multiple functions. An explanation of how to `get` and `set` the data is in `dataStore.js`. You will need to determine the internal structure of the object. If you wish, you are allowed to modify this data structure.

For example, you could define a structure in a file that is empty, and as functions are called, the structure populates and fills up like the one below:

```javascript
const data = {
    'users': [
        {
            'id': 1,
            'name' : 'user1',
        },
        {
            'id': 2,
            'name' : 'user2',
        },
    ],
    'channels': [
        {
            'id': 1,
            'name' : 'channel1',
        },
        {
            'id': 2,
            'name' : 'channel2',
        },
    ],
}
```

### 3.7. Dryrun

We have provided a very simple dryrun for iteration 1 consisting of 4 tests, one each for your implementation of `clearV1`, `authRegisterV1`, `channelsCreateV1`, and `channelsListV1`. These only check the format of your return types and simple expected behaviour, so do not rely on these as an indicator of the correctness of your implementation or tests.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 1
```

### 3.8. Bad Assumptions

Here are a few examples of bad assumptions:

* Assume that all groups store their data in a field called data which is located in dataStore.js
* Assume all individual return values are returned as single values rather than being stored in an object
* Assume the functions are written correctly
* Assume the input authUserId is valid

Bad assumptions are usually ones that directly contradict an explicit or implicit requirement in the specification. Good assumptions are ones that fill holes or gaps in requirements. 

Avoid "assumptions" that simply describe the implementation details irrelevant to the client, e.g. a particular method of ID generation. Instead, consider the scenarios in which the expected behaviour of Beans is not addressed clearly in the spec and document, with reasoning, your assumptions regarding such scenarios.

### 3.9. Working in parallel

This iteration provides challenges for many groups when it comes to working in parallel. Your group's initial reaction will be that you need to complete registration before you can complete channel creation, and then channel creation must be done before you can invite users into channels, etc.

There are several approaches that you can consider to overcome these challenges:

* Have people working on down-stream tasks (like the channels implementation) work with stubbed versions of the up-stream tasks. E.g. The register function is stubbed to return a successful dummy response, and therefore two people can start work in parallel.
* Co-ordinate with your team to ensure prerequisite features are completed first (e.g. Giuliana completes `authRegister` on Monday meaning Hayden can start `channelsCreate` on Tuesday).
* You can pull any other remote branch into your own using the command `git pull origin <branch_name>`.
    * This can be helpful when two people are working on functions on separate branches where one function is a prerequisite of the other, and an implementation is required to keep the pipeline passing.
    * You should pull from `master` on a regular basis to ensure your code remains up-to-date.

### 3.10. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>40%</td>
    <td><ul>
      <li>Correct implementation of specified functions</li>
      <li>Correctly written tests based on the specification requirements</li>
    </ul></td>
  </tr>
  <tr>
    <td>Code Quality</td>
    <td>25%</td>
    <td><ul>
      <li>Demonstrated an understanding of good test <b>coverage</b> (no need to run a coverage checker in this iteration)</li>
      <li>Demonstrated an understanding of the importance of <b>clarity</b> in communicating the purpose of tests and code</li>
      <li>Demonstrated an understanding of thoughtful test <b>design</b></li>
      <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
      <li>Appropriate style as described in section 8.4
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>15%</td>
    <td><ul>
      <li>Meaningful and informative git commit names being used</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures)</li>
      <li>At least 12 merge requests into master made</li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>15%</td>
    <td><ul>
      <li>A generally equal contribution between team members</li>
      <li>Clear evidence of reflection on group's performance and state of the team, with initiative to improve in future iterations</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online</li>
      <li>Use of issue board on Gitlab OR another tool approved by your tutor to track and manage tasks</li>
      <li>Effective use of agile methods such as standups</li>
      <li>Minutes/notes taken from group meetings (and stored in a logical place in the repo)</li>
    </ul></td>
  </tr>
  <tr>
    <td>Assumptions markdown file</td>
    <td>5%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible assumptions that are being made when interpreting the specification</li>
    </ul></td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 8 below.

The formula used for automarking in this iteration is:

`Mark = t * i` (Mark equals `t` multiplied by `i`)

Where:
 * `t` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests)
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests)

### 3.11. Submission

This iteration's due date and demonstration week are stated in section 5. You will demonstrate this submission in line with the information provided in section 5.

### 3.12. Peer Assessment

Reference 6.5.
## 4. Interface specifications

These interface specifications come from Hayden & COMP6080, who are building the frontend to the requirements set out below.

### 4.1. Input/Output types

#### 4.1.1. Iteration 0+ Input/Output Types
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

#### 4.1.2. Iteration 1+ Input/Output Types

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
    <td>named exactly <b>length</b></td>
    <td>integer</td>
  </tr>
  <tr>
    <td>named exactly <b>start</b></td>
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
    <td>contains substring <b>name</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>has prefix <b>is</b></td>
    <td>boolean</td>
  </tr>
  <tr>
    <td>has prefix <b>time</b></td>
    <td>integer (unix timestamp in seconds), <a href="https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript">[check this out]</a></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>messages</b></td>
    <td>Array of objects, where each object contains types { messageId, uId, message, timeSent }</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>channels</b></td>
    <td>Array of objects, where each object contains types { channelId, name }</td>
  </tr>
  <tr>
    <td>has suffix <b>Str</b></td>
    <td>string</td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>user</b></td>
    <td>Object containing uId, email, nameFirst, nameLast, handleStr</td>
  </tr>
  <tr>
    <td>(outputs only) name ends in <b>members</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
  <tr>
    <td>(outputs only) named exactly <b>users</b></td>
    <td>Array of objects, where each object contains types of <b>user</b></td>
  </tr>
</table>

### 4.2. Interface

#### 4.2.2. Iteration 1 Interface
All return values should be an object, with keys identically matching the names in the table below, along with their respective values.

All error cases should return <code>{error: 'error'}</code>, where the error message in quotation marks can be anything you like (this will not be marked).

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Error returns</th>
  </tr>
  <tr>
    <td><code>authLoginV1</code><br /><br />Given a registered user's email and password, returns their <code>authUserId</code> value.</td>
    <td><b>Parameters:</b><br /><code>{ email, password }</code><br /><br /><b>Return type if no error:</b><br /><code>{ authUserId }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li>email entered does not belong to a user</li>
        <li>password is not correct</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>authRegisterV1</code><br /><br />Given a user's first and last name, email address, and password, creates a new account for them and returns a new <code>authUserId</code>.<br /><br />A unique handle will be generated for each registered user. The user handle is created as follows:
      <ul>
        <li>First, generate a concatenation of their casted-to-lowercase alphanumeric (a-z0-9) first name and last name (i.e. make lowercase then remove non-alphanumeric characters).</li>
        <li>If the concatenation is longer than 20 characters, it is cut off at 20 characters.</li>
        <li>If this handle is already taken by another user, append the concatenated names with the smallest number (starting from 0) that forms a new handle that isn't already taken.</li>
        <li>The addition of this final number may result in the handle exceeding the 20 character limit (the handle 'abcdefghijklmnopqrst0' is allowed if the handle 'abcdefghijklmnopqrst' is already taken).</li>
      </ul>
    </td>
    <td><b>Parameters:</b><br /><code>{ email, password, nameFirst, nameLast }</code><br /><br /><b>Return type if no error:</b><br /><code>{ authUserId }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li>email entered is not a valid email (more in section 6.4)</li>
        <li>email address is already being used by another user</li>
        <li>length of password is less than 6 characters</li>
        <li>length of nameFirst is not between 1 and 50 characters inclusive</li>
        <li>length of nameLast is not between 1 and 50 characters inclusive</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channelsCreateV1</code><br /><br />Creates a new channel with the given name, that is either a public or private channel. The user who created it automatically joins the channel.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId, name, isPublic }</code><br /><br /><b>Return type if no error:</b><br /><code>{ channelId }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li>length of name is less than 1 or more than 20 characters</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channelsListV1</code><br /><br />Provides an array of all channels (and their associated details) that the authorised user is part of.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ channels }</code></td>
    <td><li><code>authUserId</code> is invalid</li></td>
  </tr>
  <tr>
    <td><code>channelsListAllV1</code><br /><br />Provides an array of all channels, including private channels (and their associated details)</td>
    <td><b>Parameters:</b><br /><code>{ authUserId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ channels }</code></td>
    <td><li><code>authUserId</code> is invalid</li></td>
  </tr>
  <tr>
    <td><code>channelDetailsV1</code><br /><br />Given a channel with ID <code>channelId</code> that the authorised user is a member of, provides basic details about the channel.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId, channelId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ name, isPublic, ownerMembers, allMembers }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channelJoinV1</code><br /><br />Given a <code>channelId</code> of a channel that the authorised user can join, adds them to that channel.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId, channelId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li>the authorised user is already a member of the channel</li>
        <li><code>channelId</code> refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channelInviteV1</code><br /><br />Invites a user with ID <code>uId</code> to join a channel with ID <code>channelId</code>. Once invited, the user is added to the channel immediately. In both public and private channels, all members are able to invite users.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId, channelId, uId }</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li><code>uId</code> does not refer to a valid user</li>
        <li><code>uId</code> refers to a user who is already a member of the channel</li>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>channelMessagesV1</code><br /><br />Given a channel with ID <code>channelId</code> that the authorised user is a member of, returns up to 50 messages between index "start" and "start + 50". Message with index 0 (i.e. the first element in the returned array of <code>messages</code>) is the most recent message in the channel. This function returns a new index "end". If there are more messages to return after this function call, "end" equals "start + 50". If this function has returned the least recent messages in the channel, "end" equals -1 to indicate that there are no more messages to load after this return.</td>
    <td><b>Parameters:</b><br /><code>{ authUserId, channelId, start }</code><br /><br /><b>Return type if no error:</b><br /><code>{ messages, start, end }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li><code>channelId</code> does not refer to a valid channel</li>
        <li><code>start</code> is greater than the total number of messages in the channel</li>
        <li><code>channelId</code> is valid and the authorised user is not a member of the channel</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>userProfileV1</code><br /><br />For a valid user, returns information about their user ID, email, first name, last name, and handle
    </td>
    <td><b>Parameters:</b><br /><code>{ authUserId, uId }</code><br /><br /><b>Return type if no error:</b><br /><code>{ user }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li><code>uId</code> does not refer to a valid user</li>
        <li><code>authUserId</code> is invalid</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><code>clearV1</code><br /><br />Resets the internal data of the application to its initial state</td>
    <td><b>Parameters:</b><br /><code>{}</code><br /><br /><b>Return type if no error:</b><br /><code>{}</code></td>
    <td>N/A</td>
  </tr>
</table>

### 4.3. Valid email format
To check an email is valid, you may use the following package and function.

```javascript
import validator from 'validator';

validator.isEmail('foo@bar.com');
```
### 4.4. Testing
A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 4.5. Pagination
The behaviour in which channelMessages returns data is called **pagination**. It's a commonly used method when it comes to getting theoretially unbounded amounts of data from a server to display on a page in chunks. Most of the timelines you know and love - Facebook, Instagram, LinkedIn - do this.

For example, in iteration 1, if we imagine a user with `authUserId` 12345 is trying to read messages from channel with ID 6, and this channel has 124 messages in it, 3 calls from the client to the server would be made. These calls, and their corresponding return values would be:
 * `channelMessages(12345, 6, 0) => { [messages], 0, 50 }`
 * `channelMessages(12345, 6, 50) => { [messages], 50, 100 }`
 * `channelMessages(12345, 6, 100) => { [messages], 100, -1 }`


### 4.6. Permissions
There are TWO different types of permissions: global permissions and channel-specific permissions. A user's primary permissions are their global permissions. Then the channel permissions are layered on top.

* Global permissions
   1) Owners (permission id 1), who can also modify other owners' permissions
   2) Members (permission id 2), who do not have any special permissions
 * Channel permissions
   1) Owners of the channel
   2) Members of the channel

Additional Rules:
* Global permissions
  * All Beans users are global members by default, except for the very first user who signs up, who is a global owner.
* Channel permissions
  * A global owner has the same permissions as a channel owner in every channel they're part of. They do not become a channel owner unless explicitly added as one (by a channel owner, or themselves). Hence, if they are removed as a global owner (and are not a channel owner), they will no longer have those channel owner permissions.

## 5. Due Dates and Weightings

|Iteration|Due date                              |Demonstration to tutor(s)      |Assessment weighting of project (%)|
|---------|--------------------------------------|-------------------------------|-----------------------------------|
|   0     |10pm Friday 23rd September (**week 2**)    |No demonstration               |5%                                 |
|   1     |10pm Friday 7th October  (**week 4**)   |In YOUR **week 5** laboratory  |30%                                |
|   2     |10pm Friday 28th October (**week 7**)    |In YOUR **week 8** laboratory  |35%                                |
|   3     |10pm Friday 18th November (**week 10**)  |No demonstration               |30%                               |

### 5.1. Submission & Late Penalties

There is no late penalty, as we do not accept late submissions. You will be assessed on the most recent version of your work at the due date and time.

To submit your work, open up a CSE terminal and run:

` $ 1531 submit [iteration] [groupname]`

For example:

` $ 1531 submit iteration1 W11A_EGGS`

Only one person per group needs to run this command. This will submit a copy of your latest git commit to our systems for automarking. 

NOTE: Our automarking will be run on your master branch at the time of submission, the `1531 submit` command is for record-keeping purposes only.

Your tutor will also request you pull up this copy when marking you in the demonstration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

Minor isolated fixes after the due date are allowed but carry a penalty to the automark, if the automark after re-running the autotests is greater than your initial automark. This penalty can be up to 30% of the automark for that iteration, depending on the number and nature of your fixes. Note that if the re-run automark after penalty is lower than your initial mark, we will keep your initial mark, meaning your automark cannot decrease after a re-run. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final automark will still be 50% (i.e. your initial mark).

If you want to have your automarking re-run:  
* create a branch, e.g. `iter1-fix`, based off the submission commit  
* make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks)  
* push the changes to GitLab  
* share the name of the branch with your tutor

### 5.2. Demonstration
The demonstrations in weeks 5 and 8 will take place during your lab sessions. All team members **must** attend these lab sessions. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15 minute Q&A in front of your tutor and potentially some other students in your tutorial. For online classes, webcams and audio are required to be on during this Q&A (your phone is a good alternative if your laptop/desktop doesn't have a webcam).

## 6. Individual Contribution
While we do award a tentative mark to your group as a whole, your actual mark for each iteration is given to you individually. Your individual mark is determined by your tutor, with your group mark as a reference point. Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Peer assessment

In general, all team members will receive the same mark (a sum of the marks for each iteration), **but if you as an individual fail to meet these criteria, your final project mark may be scaled down**, most likely quite significantly.

### 6.1. Project check-in
During your lab class, you and your team will conduct a short standup in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
|Iteration|Week/Check-in|Expected progress|
|---------|-------------|-----------------|
|   0     |**Week 2**   |Twice-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |
|   1     |**Week 3**   |Iteration 1 specification has been discussed in a meeting, at least 1 task per person has been assigned |
|   1     |**Week 4**   |1x function per person complete (tests and implementation in master)|

### 6.2. Tutorial contributions
From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials
* Participate in tutorials by asking questions and offering answers
* [online only] Have your web cam on for the duration of the tutorial and lab

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 6.3. Code contribution
All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

### 6.4. Documentation contribution
All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions such as `authRegister`, `channelInvite`, `userProfile`, etc. are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 6.5. Peer Assessment
At the end of each iteration, there will be a peer assessment survey where you will rate and leave comments about each team member's contribution to the project up until that point. 

Your other team members will **not** be able to see how you rated them or what comments you left in either peer assessment. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down.

<table>
  <tr>
    <th>Iteration</th>
    <th>Link</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td><a href="https://forms.office.com/Pages/ResponsePage.aspx?id=pM_2PxXn20i44Qhnufn7o_RvPhdrUs1DpZ0MlMs_Bf1UOFFIVDhFRk04SFpWVUE4WFBZUE5KS08xMi4u">Click here</a></td>
    <td>10pm Friday 7th October</td>
    <td>9am Monday 10th October</td>
  </tr>
  <tr>
    <td>2</td>
    <td><a href="https://forms.office.com/Pages/ResponsePage.aspx?id=pM_2PxXn20i44Qhnufn7o_RvPhdrUs1DpZ0MlMs_Bf1UMkxUTU1STFg3NVk2OEFGRDFVSDBRRzI5Vy4u">Click here</a></td>
    <td>10pm Friday 28th October</td>
    <td>9am Monday 31st October</td>
  </tr>
  <tr>
    <td>3</td>
    <td><a href="https://forms.office.com/Pages/ResponsePage.aspx?id=pM_2PxXn20i44Qhnufn7o_RvPhdrUs1DpZ0MlMs_Bf1UOUlaQklVN0I2TFNJUzBZMUpMOU1BSVlKVi4u">Click here</a></td>
    <td>10pm Friday 18th November</td>
    <td>9am Monday 21st November</td>
  </tr>
</table>

### 6.6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS teams. Make sure you have:
1. Been clear about the issue you feel exists
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 7. Automarking & Leaderboard
### 7.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 2.5 minute timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 2.5 minutes to run on the pipeline, you don't have to worry about it potentially taking longer when we run automarking.

### 7.2. Leaderboard
In the days preceding iterations 1, 2, and 3's due date, we will be running your code against the actual automarkers (the same ones that determine your final mark) and publishing the results of every group on a leaderboard. [The leaderboard will be available here once released](http://cgi.cse.unsw.edu.au/~cs1531/22T3/leaderboard).

The leaderboard will be run on Monday, Wednesday, and Friday afternoons during the week that the iteration is due.

Your position and mark on the leaderboard will be referenced against an alias for your group (for privacy). This alias will be emailed to your group in week 3. You are welcome to share your alias with others if you choose! (Up to you.)

The leaderboard gives you a chance to sanity check your automark (without knowing the details of what you did right and wrong), and is just a bit of fun.

If the leaderboard isn't updating for you, try hard-refreshing your browser (Ctrl+R or Command+R), clearing your cache, or opening it in a private window. Also note the HTTP (not HTTPS) in the URL, as the site is only accessible via HTTP.

## 8. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.
