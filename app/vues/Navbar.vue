<template src="../html/navbar.html"></template>

<script lang="coffee">
    zouti = require "zouti"
    Vue = require "vue"
    Notifications = require "./Notifications.vue"
    Errors = require "./Errors.vue"
    Navbar =
        data: ->
            return {
                user: {
                    username: ""
                    src: ""
                    teams: []
                }
                messages: {
                    count: 0
                }
                selectedTeam: {
                    name: ""
                }
                selectedProject: {
                    name: ""
                }
                shownavbar: true
                isUserDropdownVisible: false
                isTeamDropdownVisible: false
                isOffline: false
                isOfflineTooltipVisible: false
            }

        directives:
            focus: (require "vue-focus").focus

        components:
            "notifications": Notifications
            "errors": Errors

        ready: ->

            socket.on "disconnect", () =>
                @isOffline = true

            socket.on "reconnect", () =>
                @isOffline = false

            socket.on "team.initialized", ( oTeam, oProject ) =>
                oTeam.showInput = false
                oTeam.newProject = ""
                @user.teams.push oTeam
                @selectedTeam = oTeam
                localStorage.selectedTeam = oTeam.uuid
                localStorage.selectedProject = oProject.uuid
                @selectedProject = oProject
                socket.emit "user.join", @selectedProject.uuid, @selectedTeam.uuid

            socket.on "user.logged", ( oUserData ) =>
                setTimeout( () =>
                    if oUserData.teams.length < 1
                        @user.username = oUserData.username
                        @user.src = "data:image/png;base64,#{oUserData.avatar}"
                        @$route.router.go "/joinTeam"
                    else
                        @$route.router.go "/tasks"
                        @updateUserData oUserData
                , 100 )

            @displayNavbar @$route.fullPath

            socket.on "chat.new", ( message, user ) =>
                if @$route.fullPath isnt "/chat" then @messages.count++

            socket.on "team.push", ( oTeam ) =>
                @user.teams.push oTeam

        methods:

            displayNavbar: ( route ) ->
                if route is "/signin" or route is "/signup" or route is "/joinTeam"
                    @shownavbar = false
                else
                    @shownavbar = true

            toggleUserDropdown: ->
                @isUserDropdownVisible = !@isUserDropdownVisible

            toggleTeamDropdown: ->
                @isTeamDropdownVisible = !@isTeamDropdownVisible

            signout: ->
                previousProject = localStorage.selectedProject
                previousTheme = localStorage.selectedTheme
                localStorage.clear()
                localStorage.previousProject = previousProject
                localStorage.selectedTheme = previousTheme
                @user.username = ""
                @user.teams = []
                @selectedTeam = {name: ""}
                @selectedProject = {name: ""}
                @$route.router.go "/signin"
                @isUserDropdownVisible = false

            updateUserData: ( oUserData ) ->
                @user.username = oUserData.username
                @user.src = "data:image/png;base64,#{oUserData.avatar}"
                teams = oUserData.teams
                for team in teams
                    team.showInput = false
                    team.newProject = ""

                @user.teams = teams
                @selectProject( oUserData )

                socket.emit "user.join", @selectedProject.uuid, @selectedTeam.uuid

                localStorage.userId = oUserData.uuid
                localStorage.selectedTeam = @selectedTeam.uuid
                localStorage.selectedProject = @selectedProject.uuid
                localStorage.settings = oUserData.settings
                console.log "dispatching event"
                this.$dispatch "loadNotificationSettings"
                @isTeamDropdownVisible = false

            selectProject: ( oUserData ) ->
                @selectedTeam = oUserData.teams[0]
                @selectedProject = @selectedTeam.projects[0]

                for team in oUserData.teams
                    for project in team.projects
                        if project.uuid == localStorage.previousProject
                            @selectedTeam = team
                            @selectedProject = project

            changeProject: ( oTeam, oProject ) ->
                @isTeamDropdownVisible = false
                socket.emit "user.leave", @selectedTeam.uuid
                socket.emit "user.leave", @selectedProject.uuid
                this.$dispatch "changeProject", oTeam, oProject
                this.selectedTeam = oTeam
                this.selectedProject = oProject

            showInput: ( oTeam ) ->
                oTeam.showInput = true

            hideInput: ( oTeam ) ->
                oTeam.showInput = false

            addProject: ( oTeam ) ->
                if oTeam.newProject == "" then return

                project = {
                    name: oTeam.newProject
                    uuid: zouti.uuid()
                    teamId: oTeam.uuid
                }

                socket.emit "project.create", project, ( oResult ) =>
                    oTeam.projects.push oResult
                    oTeam.newProject = ""
                    oTeam.showInput = false

                    socket.emit "user.join", oResult.uuid, oResult.teamUuid

                    @changeProject oTeam, oResult

        events:

            navigateToProject: ( oProject ) ->
                oTeam = {}
                for team in @user.teams
                    if team.uuid == oProject.teamUuid
                        oTeam = team
                        break
                @changeProject oTeam, oProject

            leftTeam: ( sTeamId ) ->
                @user.teams.forEach ( oTeam, index ) =>
                    if oTeam.uuid == sTeamId
                        @user.teams.splice index, 1

            test: ->
                console.log "in navbar vue"

        watch:
            $route: ( newValue, oldValue ) ->
                @displayNavbar newValue.fullPath
                if @$route.fullPath is "/chat"
                    @messages.count = 0

        filters:
            caseInsensitiveOrderBy: (arr, sortKey, reverse) ->
                if !sortKey then return arr
                order = if reverse && reverse < 0 then -1 else 1
                order = if reverse then -1 else 1

                return arr.slice().sort (a, b) ->
                    if sortKey != '$key'
                        if (Vue.util.isObject(a) && '$value' in a) then a = a.$value
                        if (Vue.util.isObject(b) && '$value' in b) then b = b.$value

                    if Vue.util.isObject(a) then a = Vue.parsers.path.getPath(a, sortKey) else a = a
                    if Vue.util.isObject(b) then b = Vue.parsers.path.getPath(b, sortKey) else b = b

                    a = a.toLowerCase()
                    b = b.toLowerCase()

                    if a == b then return 0 else if a > b then return order else return -order

    module.exports = Navbar
</script>