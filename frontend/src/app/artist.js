import { configureStore } from "@reduxjs/toolkit";
import testReducer from "../slice/test"
import blockedDateReducer from "../slice/blockedDate"
import songRegisterReducer from "../slice/song_registration"
import newReleaseReducer  from "../slice/newRelease";
import ticketReducer  from "../slice/ticket";
import profileReducer  from "../slice/profile";
import eventReducer from "../slice/events";
import notificationReducer from "../slice/notification";
import incomeReducer from "../slice/income";
import websiteConfigReducer from "../slice/website_config";
import artistReducer from "../slice/artist"
import topPickReducer from "../slice/top_pick"
import contentReducer from "../slice/content"
import leaderboardReducer from "../slice/leaderboard"
import contentInteractionReducer from "../slice/contentInteractionSlice"

export const artistStore = configureStore({
    reducer : {
        test : testReducer,
        blockedDate : blockedDateReducer,
        songRegister : songRegisterReducer,
        newRelease : newReleaseReducer,
        ticket : ticketReducer,
        profile : profileReducer,
        event : eventReducer,
        notification: notificationReducer,
        income : incomeReducer,
        websiteConfig: websiteConfigReducer,
        artist : artistReducer,
        topPick : topPickReducer,
        event : eventReducer,
        content : contentReducer,
        leaderboard : leaderboardReducer,
        contentInteraction: contentInteractionReducer,
    }
})

//tes