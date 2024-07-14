import pkg from '../../package.json';

export const constants = {
    apiCallsPerPage: 4 // number of API calls "Stack Me First" uses per page
}

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
    // use `/sites` API to get a list of all sites
    // https://api.stackexchange.com/docs/sites#pagesize=30&filter=default&run=true
    "stackoverflow.com",
    "stackexchange.com",
    "mathoverflow.net",
    "askubuntu.com",
    "superuser.com",
    "serverfault.com",
    "stackapps.com",
]

export const excludedSites = [
    "api.stackexchange.com",
    "data.stackexchange.com"
]

export const pageTypeEnum = {
    popup: "popup",
    sidebar: "sidebar",
    options: "options",
    background: "background",
    gettingStarted: "getting started"
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

export const affiliateIds = {
    "stackoverflow.com": "6908282",
    "superuser.com": "863212",
    "meta.stackexchange.com": "381523",
    "stackapps.com": "96492",
    "computergraphics.stackexchange.com": "19180",
    "emacs.stackexchange.com": "36093",
    "webapps.stackexchange.com": "173960",
    "graphicdesign.stackexchange.com": "169726",
    "sharepoint.stackexchange.com": "75471",
    "blender.stackexchange.com": "82724",
    "softwarerecs.stackexchange.com": "68472",
    "ell.stackexchange.com": "123311",
    "puzzling.stackexchange.com": "81234",
}

export const devModeSuffix =  " (Dev " + pkg.version + ")";
