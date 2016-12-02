var AppDispatcher = require('../dispatcher/AppDispatcher');
var ManageConstants = require('../constants/ManageConstants');


var ManageActions = {
    /********* SEGMENTS *********/

    /** Render the list of projects
     * @param projects
     */
    renderProjects: function (projects) {
        AppDispatcher.dispatch({
            actionType: ManageConstants.RENDER_PROJECTS,
            project: projects,
        });
    },


};

module.exports = ManageActions;