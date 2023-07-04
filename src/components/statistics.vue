<script>
export default {
    props: {
      profilTop: {
        type: Array,
        default: () => [],
      },
      topTracks: {
        type: Array,
        default: () => [],
      },
      profilPhoto: {
        type: String,
        default: '/user.png',
      },
      profilDisplayName: {
        type: String,
      default: '',
      }
    },
    data() {
        return {
            userPp: '/user.png',
            topTracksWithCovers: [],
        }
    }
}
</script>

<template>
  <div class="allStats">
    <div class="infosUser">
        <div class="userTop">
          <h3>{{ profilDisplayName }}</h3>
          <img :src="profilPhoto" alt="" id="imgUrl">
        </div>
    </div>
    <div class="favArtists favDiv">
        <div class="titleFavArtists titleTop">
          <img src="/top.svg" alt=""/><h4>Artistes Favoris</h4>
        </div>
        <ul>
          <li v-for="artist in profilTop" :key="artist">{{ artist }}</li>
        </ul>
    </div>
    <div class="favSongs favDiv">
        <div class="titleFavSongs titleTop">
          <img src="/top.svg" alt=""/><h4>Musiques Favorites</h4>
        </div>
        <ul>
          <li v-for="track in topTracks" :key="track.name">
            <img :src="track.coverUrl" alt="" class="trackCover" />
            <span>{{ track.name }}</span>
          </li>

        </ul>
    </div>
  </div>
</template>

<style>
.allStats .favArtists, .allStats .favSongs{
    background-color: #E1765A;
    border-radius: 15px;
    padding: 0.5em;
    width: 20em;
}
.allStats .favDiv img{
    width: 3em;
}
.allStats .titleTop{
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
}
.allStats{
    display: flex;
    flex-direction: row;
}
.allStats .favDiv{
    margin: 1em;
}
.allStats .userTop{
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
}
.allStats .infosUser{
    border-radius: 15px;
    padding: 0.5em;
    width: 20em;
    background-color: #8F9A9D  ;
    margin: 1em
}
.allStats .userTop img{
    width: 10em;
    border-radius: 50%;
}
h2{
    margin-left: 2.4em;
}
.trackCover {
  width: 1.5em;
  margin-right: 0.5em;
}
</style>