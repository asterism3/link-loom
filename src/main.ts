import { App, Plugin, PluginSettingTab, Setting, TFile, Notice} from 'obsidian';

//Define a type for Profile settings to strcuture the data we'll use 
interface Profile {
    name: string;
    dateOfBirth: string;
    groups: string[];
    role: string;
    importance: number;
    connectionLevel: number;
    closeness: number;
    relations: {[key:string]:string };//e.g.,{'profile_id_1': 'friend'}
    activities:Activity[];
    profilePicture: string;
}


interface Activity {
    date: string;
    details: string;
}

//Main plugin class extending Obsidian Plugin Class
export default class NetworkManagerPlugin extends Plugin {
    //To hold profiles
    private profiles: Map<string, Profile> = new Map();

    async onload() {
        console.log('Loading Network Manager Plugin');

        //Register a command to show the homepage
        this.addCommand({
            id:'show-homepage',
            name: 'Show Homepage',
            callback:() => this.showHomepage(),
        });

        //register the setting tab
        this.addSettingTab(new NetworkManagerSettingTab(this.app, this));

        //Load profiles on startup
        await this.loadProfiles();
    }

    async loadProfiles() {
        const dv = this.app.plugins.getPlugin('dataview')?.api as DataviewApi;
        if (!dv) {
            new Notice('Dataview plugin not found. Please install it.');
            return;
    }
    
    const profileFolder = 'Profiles';
    const files = this.app.vault.getFiles();
    const profileFiles = files.filter(file => file.path.startsWith(profileFolder) && file.extension ==='md');
    
    for (const file of profileFiles) {
        const fileContent = await this.app.vault.read(file);
        //use dataview to parse and extract profile info
        const profileData = dv.page(file.path);

        if (profileData) {
            const profile: Profile = {
                name: profileData.name,
                dateOfBirth: profileData.dateOfBirth,
                groups: profileData.groups || [],
                role: profileData.role,
                importance: profileData.importance,
                connectionLevel: profileData.connectionLevel || 1,
                closeness: profileData.closeness || 1,
                relations: profileData.relations || {},
                activities: profileData.activities || [],
                profilePicture: profileData.profilePicture || '',

            };

            this.profiles.set(file.path, profile)
        }
    }
    
    console.log('Profile loaded:', this.profiles)
    
    
    showHomepage(){
        console.log('Homepage display function triggered');
    }
}

class NetworkManagerSettingTab extends PluginSettingTab {
    plugin: NetworkManagerPlugin;

    constructor(app: App,plugin:NetworkManagerPlugin) {
        super(app,plugin);
        this.plugin=plugin;
    }

    display(): void{
        const { containerEl }=this;

        containerEl.empty();
        containerEl.createEl('h2',{ text:'Network Maager Settings'});
        //date format setting
        new Setting(containerEl)
        .setName('Example Setting')
        .setDesc('This is a placeholder setting.')
        addtext(text =>text.setPlaceholder('Enter something...'))
    }
}



 