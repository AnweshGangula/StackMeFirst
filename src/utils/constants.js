export const StackAppDetails = {
    firefox: {
        clientId: 24355,
        key: "GZEA1Nu3Jb4K*CvaiVi5zQ((",
    },
    chromium: {
        clientId: 24029,
        key: "1jY1xGKt)NGfZQwE3RbWHQ((",
    }
}

export const stackCommunities = [
    "stackoverflow.com",
    "stackexchange.com",
    "mathoverflow.net",
    "askubuntu.com",
    "superuser.com",
    "serverfault.com",
    "stackapps.com",
]

export const pageTypeEnum = {
    popup: "popup",
    sidebar: "sidebar",
    options: "options",
};

export const ignoreUrlList = [
    "/ask",
    "/tagged",
    "/linked",
];

export const defaultPreferances = {
    hlAns: true,
    srtAns: true,
    hlCmnts: false,
    hlLinkQs: false,
    displaySidebar: true,
    dockSidebar: false,
};

export const defaultApiData = {
    token: "",
    userName: "",
    profileImage: "",
    profileUrl: "",
};

export const suffix = {
    hidden: " (hidden)",
    favorite: " (favorite)",
    author: " (author)",
}

export const upvoteFilter = {
    includeFeilds: [
        "question.upvoted",
        "answer.upvoted",
    ],
    excludeFeilds: [],
    base: "none",
}

export const customFilterEg = {
    includeFeilds: [
        'question.title',
        'question.creation_date',
        'question.view_count',
        'question.favorite_count',
        'question.up_vote_count',
        'question.tags',
        'question.link',
    ],
    excludeFeilds: [
        'question.accepted_answer_id',
        'question.answer_count',
        'question.bounty_amount',
        'question.bounty_closes_date',
        'question.closed_date',
        'question.closed_reason',
        'question.community_owned_date',
        'question.is_answered',
        'question.last_activity_date',
        'question.last_edit_date',
        'question.locked_date',
        'question.migrated_from',
        'question.migrated_to',
        'question.owner',
        'question.protected_date',
        'question.question_id',
        'question.score',
    ],
    base: "default",
}