import TeamSelect from "./TeamsSelect";
import ProjectInfo from "./HeaderProjectInfo";
import FilterProjects from "./manage/FilterProjects"
import TeamConstants from "../../constants/TeamConstants";
import CatToolConstants from "../../constants/CatToolConstants";
import TeamsStore from "../../stores/TeamsStore";
import CatToolStore from "../../stores/CatToolStore";
import IconManage from "../icons/IconManage";
import IconUserLogout from "../icons/IconUserLogout";
import ActionMenu from "./ActionMenu";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            selectedTeamId: null,
            user: this.props.user,
            loggedUser: this.props.loggedUser
        };
        this.renderTeams = this.renderTeams.bind(this);
        this.updateTeams = this.updateTeams.bind(this);
        this.chooseTeams = this.chooseTeams.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.initProfileDropdown = this.initProfileDropdown.bind(this);
		this.showPopup = true;
    }

	componentDidMount = () => {
		TeamsStore.addListener(TeamConstants.RENDER_TEAMS, this.renderTeams);
		TeamsStore.addListener(TeamConstants.UPDATE_TEAMS, this.updateTeams);
		TeamsStore.addListener(TeamConstants.CHOOSE_TEAM, this.chooseTeams);
        TeamsStore.addListener(TeamConstants.UPDATE_USER, this.updateUser);
		CatToolStore.addListener(CatToolConstants.SHOW_PROFILE_MESSAGE_TOOLTIP , this.initMyProjectsPopup);
		this.initProfileDropdown();
	}

	componentWillUnmount = () => {
		TeamsStore.removeListener(TeamConstants.RENDER_TEAMS, this.renderTeams);
		TeamsStore.removeListener(TeamConstants.UPDATE_TEAMS, this.updateTeams);
		TeamsStore.removeListener(TeamConstants.CHOOSE_TEAM, this.chooseTeams);
		TeamsStore.removeListener(TeamConstants.UPDATE_USER, this.updateUser);
		CatToolStore.removeListener(CatToolConstants.SHOW_PROFILE_MESSAGE_TOOLTIP , this.initMyProjectsPopup);
	}

	componentDidUpdate() {
	}

	initProfileDropdown = () => {
		let dropdownProfile = $(this.dropdownProfile);
		dropdownProfile.dropdown();
	}

	logoutUser() {
		$.post('/api/app/user/logout',function(data){
			if ($('body').hasClass('manage')) {
				location.href = config.hostpath + config.basepath;
			} else {
				window.location.reload();
			}
		});
	}

	renderTeams = (teams) => {
		this.setState({
			teams: teams
		});
	}

	updateTeams = (teams) => {
		this.setState({
			teams: teams,
		});
	}

	chooseTeams = (id) => {
		this.selectedTeam = this.state.teams.find(org => {
			return org.get('id') == id;
		});
		this.setState({
			selectedTeamId: id,
		});
	}

	openPreferencesModal = () => {
		$('#modal').trigger('openpreferences');
	}

	openLoginModal = () => {
		$('#modal').trigger('openlogin');
	}

    updateUser = (user) => {
        this.setState({
            user : user,
            loggedUser: true
        });
        setTimeout(this.initProfileDropdown)
    }

	openManage =  () => {
		document.location.href = '/manage';
	};

	getUserIcon = () => {
		if ( this.state.loggedUser ) {
			if (this.state.user.metadata && this.state.user.metadata.gplus_picture) {
				return 	<div className={"ui dropdown"} ref={(dropdownProfile) => this.dropdownProfile = dropdownProfile} id={"profile-menu"}>
							<img className="ui mini circular image ui-user-top-image"
								 src={this.state.user.metadata.gplus_picture + "?sz=80"} title="Personal settings"
								 alt="Profile picture"/>
							<div className="menu">
								<div className="item" data-value="Manage" id="manage-item" onClick={this.openManage.bind(this)}>My Projects</div>
								<div className="item" data-value="profile" id="profile-item" onClick={this.openPreferencesModal.bind(this)}>Profile</div>
								<div className="item" data-value="logout" id="logout-item" onClick={this.logoutUser.bind(this)}>Logout</div>
							</div>
						</div>

			}
			return <div className={"ui dropdown"} ref={(dropdownProfile) => this.dropdownProfile = dropdownProfile} id={"profile-menu"}>
				<div className="ui user circular image ui-user-top-image" title="Personal settings">{config.userShortName}</div>
				<div className="menu">
					<div className="item" data-value="Manage" id="manage-item" onClick={this.openManage.bind(this)}>My Projects</div>
					<div className="item" data-value="profile" id="profile-item" onClick={this.openPreferencesModal.bind(this)}>Profile</div>
					<div className="item" data-value="logout" id="logout-item" onClick={this.logoutUser.bind(this)}>Logout</div>
				</div>
			</div>
				// <div className="ui user label"
				// 		onClick={this.openPreferencesModal.bind(this)}>{config.userShortName}</div>
		} else {
			return <div className="ui user-nolog label" onClick={this.openLoginModal.bind(this)} title="Login">
				{/*<i className="icon-user22"/>*/}
				<IconUserLogout width={40} height={40} color={'#fff'} />
			</div>

		}
	};

	initMyProjectsPopup = () => {
		if ( this.showPopup ) {
			var tooltipTex = "<h4 class='header'>Manage your projects</h4>" +
				"<div class='content'>" +
				"<p>Click here, then \"My projects\" to retrieve and manage all the projects you have created in MateCat.</p>" +
				"<a class='close-popup-teams'>Got it!</a>" +
				"</div>";
			$( this.dropdownProfile ).popup( {
				on: 'click',
				onHidden: () => this.removePopup(),
				html: tooltipTex,
				closable: false,
				onCreate: () => this.onCreatePopup(),
				className: {
					popup: 'ui popup user-menu-tooltip'
				}
			} ).popup( "show" );
			this.showPopup = false;
		}
	};

	removePopup = () => {
		$(this.dropdownProfile).popup('destroy');
		CatToolActions.setPopupUserMenuCookie();
		return true;
	};

	onCreatePopup = () => {
		$('.close-popup-teams').on('click', () => {
			$(this.dropdownProfile).popup('hide');
		})
	};

	getHeaderComponentToShow = () => {

		if (this.props.showFilterProjects) {
			return <div className="nine wide column">
				<FilterProjects
					selectedTeam={this.selectedTeam}
				/>
			</div>;
		} else if (this.props.showJobInfo) {
			return <div className="nine wide column header-project-container-info">
				<ProjectInfo/>
			</div>;
		}
	}

    /**
     * Used by plugins to add buttons to the home page
     */
    getMoreLinks() {
        return null;
    }

	render = () => {
		const {getHeaderComponentToShow, getUserIcon} = this;
		const {showLinks, showJobInfo, showFilterProjects, showModals, showTeams, changeTeam, isQualityReport} = this.props;
		const {teams,selectedTeamId, loggedUser} = this.state;

		const userIcon = getUserIcon();
		let containerClass = "user-teams four";
		const componentToShow = getHeaderComponentToShow();

		if (showLinks) {
			containerClass = "user-teams thirteen";
		} else if (showJobInfo) {
			containerClass = "user-teams three";
		}

		return <section className="nav-mc-bar ui grid">

			<nav className="sixteen wide column navigation">
				<div className="ui grid">
					<div className="three wide column">
						<a href="/" className="logo"/>
					</div>
					{componentToShow}

					<div className={containerClass + " wide column right floated"}>
						{(showLinks) ? (
							<div>
								<ul id="menu-site">
									<li><a href="/about/">About</a></li>
									<li><a href="/benefits/">Benefits</a></li>
									<li><a href="/outsourcing/">Outsource</a></li>
									<li><a href="/open-source/">Opensource</a></li>
									<li><a href="/support/">Contact us</a></li>
									{/*<li><a href="/plugins/aligner/index"  target="_blank" className={"btn btn-primary"}>Aligner</a></li>*/}
                                    { this.getMoreLinks() }
								</ul>
							</div>

						) : ('')}

						{!!showFilterProjects && <TeamSelect
							isManage={showFilterProjects}
							showModals={showModals}
							loggedUser={loggedUser}
							showTeams={showTeams}
							changeTeam={changeTeam}
							teams={teams}
							selectedTeamId={selectedTeamId}
						/>}
						{!!isQualityReport && <ActionMenu />}
						{/*<div className={"separator"}></div>*/}
						{/*{!!loggedUser && !showFilterProjects && <div title="Manage" id="action-manage">*/}
						{/*											<a className={"action-submenu"} href={'/manage'}>*/}
						{/*												<IconManage width={'36'} height={'36'} style={{float:'right'}} />*/}
						{/*											</a>*/}
						{/*										</div>}*/}
						{userIcon}
					</div>

				</div>
			</nav>
		</section>;
	}
}

Header.defaultProps = {
	showFilterProjects: false,
	showJobInfo: false,
	showModals: true,
	showLinks: false,
	loggedUser: true,
	showTeams: true,
	changeTeam: true,
	isQualityReport:false,

};

export default Header;
