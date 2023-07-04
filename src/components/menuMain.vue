<script>
import Statistics from './statistics.vue';

export default {
    components: {
        Statistics,
    },
    data() {
        return {
            clientId : "acaeff2992e246a3aaac94ae516d739b",
            params : new URLSearchParams(window.location.search),
            code : null,
            accessToken : null,
            profil : null,
            profilTop : [],
            topTracks : [],
            topArtists : [],
        }
    },
    mounted(){
        this.code = this.params.get("code");
        this.accessToken = localStorage.acces_token;
        if(this.code == null && (this.accessToken == null || this.accessToken == undefined)) {  // IF DEOSN'T HAVE CODE AND TOKEN
            console.log('no token')
            return;
        }   
        else if (this.code != null) { // IF THEY HAVE TOKEN
            this.getAccessToken(this.clientId, this.code)
            .then(access_token => {
                console.log('get token');
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Failed to get access token:', error);
            });
        }
        if (this.isTokenExpired()) {
            return;
        } 
        else {
            this.displayProfil();
        }
    },
    methods : {
        async redirectToAuthCodeFlow() {
            const verifier = this.generateCodeVerifier(128);
            const challenge = await this.generateCodeChallenge(verifier);

            localStorage.setItem("verifier", verifier);

            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("response_type", "code");
            params.append("redirect_uri", "http://localhost:5173/callback");
            params.append("scope", "user-read-private user-read-email user-top-read user-read-recently-played");
            params.append("code_challenge_method", "S256");
            params.append("code_challenge", challenge);

            document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
        },

        generateCodeVerifier(length) {
            let text = '';
            let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
            for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        },

        async generateCodeChallenge(codeVerifier) {
            const encoder = new TextEncoder();
            const data = encoder.encode(codeVerifier);
            const digestBuffer = await crypto.subtle.digest("SHA-256", data);
            const digestArray = Array.from(new Uint8Array(digestBuffer));
            const base64Digest = btoa(String.fromCharCode(...digestArray));
            const base64UrlDigest = base64Digest
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            return base64UrlDigest;
        },

        async getAccessToken(clientId, code) {
            const verifier = localStorage.getItem("verifier");

            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", "http://localhost:5173/callback");
            params.append("code_verifier", verifier);

            const result = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            });

            const { access_token } = await result.json();

            let a = new Date();
            a.setSeconds(a.getSeconds() + 3600);

            localStorage.setItem('expire_in',a.getTime());
            localStorage.setItem('acces_token',access_token);

            return access_token;
        },

        async fetchProfil() {
            
            const token = localStorage.acces_token;

            const result = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", 
                headers: { Authorization: `Bearer ${token}` }
            });

            return result.json();
        },
        fetchProfilTop() {
            try {
                const token = localStorage.acces_token;

                return fetch("https://api.spotify.com/v1/me/top/artists?limit=5", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                })
                .then(response => response.json())
                .then(data => {
                const topArtists = data.items.map(item => {
                    return {
                        name: item.name,
                        imageUrl: item.images.length > 0 ? item.images[0].url : ''
                    };
                });
                return topArtists;
                })
                .catch(error => {
                    console.error("Failed to fetch top artists:", error);
                    return [];
                });
            } catch (error) {
                console.error("Failed to fetch top artists:", error);
                return [];
            }
        },
        fetchProfilTopMusics() {
            try {
                const token = localStorage.acces_token;

                return fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                })
                .then(response => response.json())
                .then(data => {
                const topTracks = data.items.map(item => {
                    return {
                    name: item.name,
                    coverUrl: item.album.images.length > 0 ? item.album.images[0].url : ''
                    };
                });
                return topTracks;
                })
                .catch(error => {
                    console.error("Failed to fetch top tracks:", error);
                    return [];
                });
            } catch (error) {
                console.error("Failed to fetch top tracks:", error);
                return [];
            }
        },

        // fetchProfilLastMusics() {
        //     try {
        //         const token = localStorage.acces_token;

        //         return fetch("https://api.spotify.com/v1/me/player/recently-played", {
        //         method: "GET",
        //         headers: { Authorization: `Bearer ${token}` },
        //         })
        //         .then(response => response.json())
        //         .then(data => {
        //         const lastPlayed = data.items.map(item => {
        //             return {
        //             };
        //         });
        //         return lastPlayed;
        //         })
        //         .catch(error => {
        //             console.error("Failed to fetch last played:", error);
        //             return [];
        //         });
        //     } catch (error) {
        //         console.error("Failed to fetch last played:", error);
        //         return [];
        //     }
        // },

        displayProfil() {
            Promise.all([this.fetchProfil(), this.fetchProfilTop(), this.fetchProfilTopMusics()])
                .then(([profil, topArtists, topTracksWithCovers]) => {
                    if (profil) {
                        this.profil = profil;
                        this.profilTop = topArtists;
                        this.topTracks = topTracksWithCovers;
                        this.topArtists = topArtists; // Assurez-vous d'ajouter cette ligne pour définir la propriété topArtists
                        this.populateUI();
                    } else {
                        console.error("Failed to fetch profile data.");
                    }
                })
                .catch(error => {
                    console.error("Failed to display profile:", error);
                });
        },

        populateUI() {
            if (this.profil) {
                document.getElementById("displayName").innerText = this.profil.display_name;
                document.getElementById("imgUrl").src = this.profil.images[0].url;
                console.log('image: ',this.profil.images[0].url)
            }
        },

        isTokenExpired() {
            const expire_in_timestamp = localStorage.isTokenExpired
            const now_timestamp = Date.now();
            return expire_in_timestamp <= now_timestamp;
        },

        logOut(){
            localStorage.removeItem("acces_token");
            localStorage.removeItem("isTokenExpired");
            document.location.href="/";
        }
    }
}
</script>

<template>
    <div class="mainHome">
        <div class="mainNav">
            <nav>
                <div class="navTop">
                    <button v-if="this.code == null && (this.accessToken == null || this.accessToken == undefined)" id="buttonConexion" @click="redirectToAuthCodeFlow(clientId)"><img src="/stats.svg" alt=""/>Connexion</button>
                    <button v-if="this.accessToken != null" id="buttonLogOut" @click="logOut"><img src="/cross.svg" alt=""/>Déconnection</button>
                </div>
            </nav>
        <div class="navBottom">
            <h1>Statistiques Spotify</h1>
            <img src="/stats-home.svg" alt="">
        </div>
    </div>
</div>
<router-view />
<statistics v-if="profilTop.length > 0" :profilTop="profilTop" :topArtists="topArtists" :topTracks="topTracks" :profilPhoto="profil.images[0].url" :profilDisplayName="profil.display_name" />


</template>

<style>
.mainHome{
    background-color: #353535;
    border-radius: 0 0 25px 25px;
}
nav .navTop{
    border: 2px solid #1DB954;
    border-radius: 15rem;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: row;
    margin-top: 1em;
}
.mainNav{
    height: 40em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
nav .navTop img{
    width: 1.1em;
    margin-right: 0.5em;
    display: flex;
    align-items: end;
}
nav .navTop button{
    display: flex;
    align-items: center;
    flex-direction: row;
}
.mainNav .navBottom{
    display: flex;
    justify-content: space-between;
}
.navBottom img{
    width: 50em;
    margin-right: 1em;
    margin-bottom: 1em;
}
nav{
    display: flex;
    justify-content: center;
}
h1 {
    font-size: 4.5em;
    line-height: 1.1;
    margin-left: 1em;
    display: flex;
    align-items: end;
}
</style>