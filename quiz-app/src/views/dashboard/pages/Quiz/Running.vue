<template>
  <v-container id="add-quiz" fluid tag="section">
    <table-loader v-if="loading"></table-loader>
    <template v-else>
      <v-app-bar app color="rgb(156, 39, 176)" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Quiz App</v-toolbar-title>
      <v-spacer></v-spacer>
      <router-link to="/">Home</router-link>
    </v-app-bar>
      <v-app>
        <v-main class="login-background">
          <v-row justify="center">
            <v-col cols="12" md="8">
              <base-material-card title="MCQ">
                <v-container v-if="form.mcqs && form.mcqs.length > 0">
                  <form action="">
                    <v-row align="center" v-for="(mcq, index) in form.mcqs" :key="mcq.id">
                      <v-card width="100%" :name="mcq.id">
                        <v-col cols="12" md="12">
                          <h3>Question No #{{index+1}}: {{ mcq.question }}</h3>
                        </v-col>
                        <v-col cols="12">
                          <div v-for="n in 5" :key="mcq.id+n">
                            <v-radio-group v-model="mcq.given_answer">
                              <v-radio :label="mcq['option_' + n]" color="primary" :value="n"></v-radio>
                            </v-radio-group>
                          </div>
                        </v-col>
                      </v-card>
                    </v-row>
                  </form>
                </v-container>

                <v-container class="pa-0" fluid v-else>
                  <h3>
                    No MCQ Found
                  </h3>
                </v-container>
              </base-material-card>
            </v-col>
          </v-row>
          <v-speed-dial style="position: fixed; top: 300px; right: 100px;" open-on-hover>
            <template v-slot:activator>
              <v-btn color="blue darken-2" large dark>
                Submit
              </v-btn><br> <br>
              <router-link to="/">Home</router-link>
            </template>
            <v-btn dark color="green" @click="confirmComplete">
              Confirm
            </v-btn>
            
          </v-speed-dial>
          <v-chip class="ma-2 large" color="secondary" style="position: fixed; top: 100px; z-index: 100">
            <h1>{{ moment.utc(moment.duration(timerCount,'seconds').as('milliseconds')).format('HH:mm:ss') }}
            </h1>
            <v-icon right>
              mdi-clock
            </v-icon>
          </v-chip>

          <!-- Modal pour afficher les résultats -->
          <v-dialog v-model="showResultsModal" max-width="500">
            <v-card>
              <v-card-title>
                Résultats du quiz
              </v-card-title>
              <!-- Contenu du modal (les résultats du quiz) -->
              <!-- Vous pouvez personnaliser ce contenu en fonction de vos besoins -->
              <v-card-actions>
                <!-- Lien pour voir les résultats -->
                <router-link :to="{ name: 'TestResult', params: { id: attempt_id }}">
                  Voir résultats
                </router-link>
                <v-btn color="primary" @click="showResultsModal = false">Fermer</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-main>
      </v-app>
    </template>
  </v-container>
</template>

<style scoped>
.v-main {
  background-image: url("~@/assets/img/bgMain.png");
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}
</style>

<script>
import navigation from "@/components/homepage/Navigation";
import foote from "@/components/homepage/Footer";
import home from "@/components/homepage/HomeSection";
import ApiService from "@/common/api.service";
import TableLoader from "@/components/base/TableLoader";

export default {
  name: "RunningQuiz",

  components: {
    navigation,
    foote,
    home,
    TableLoader
  },

  data: () => ({
    fab: null,
    color: "",
    flat: null,
    timerCount: 0,
    loading: false,
    remaining_time: 0,
    attempt_id: '',
    data: {},
    form: {
      mcqs: []
    },
    showResultsModal: false // Variable pour contrôler la visibilité du modal
  }),

  created() {
    const top = window.pageYOffset || 0;
    if (top <= 60) {
      this.color = "transparent";
      this.flat = true;
    }
    this.get();
  },

  watch: {
    fab(value) {
      if (value) {
        this.color = "secondary";
        this.flat = false;
      } else {
        this.color = "transparent";
        this.flat = true;
      }
    },

    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        }
      },
      immediate: true
    }
  },

  methods: {
    onScroll(e) {
      if (typeof window === "undefined") return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.fab = top > 60;
    },

    toTop() {
      this.$vuetify.goTo(0);
    },

    get() {
      this.loading = true;
      ApiService.setHeader();
      ApiService.get(`/pub/quiz/${this.$route.params.id}/mcq`)
        .then((resp) => {
          this.loading = false;
          this.form.mcqs = resp.data.data.mcqs;
          this.start();
        })
        .catch((err) => {
          this.$toastr.e(err);
          this.loading = false;
        });
    },

    complete() {
      ApiService.post(`/pub/attempts/${this.attempt_id}/complete`, this.form)
        .then(async () => {
          this.loading = false;
        })
        .catch((err) => {
          this.$toastr.e(err);
          this.loading = false;
        });
    },

    start() {
      ApiService.post(`/pub/quiz/${this.$route.params.id}/start`, {
          attempt_id: this.attempt_id
        })
        .then((resp) => {
          this.loading = false;
          this.attempt_id = resp.data.attempt_id;
          if (resp.data.remaining_time == null) {
           
          } else {
            this.timerCount = resp.data.remaining_time;
          }
        })
        .catch((err) => {
          this.$toastr.e(err);
          this.loading = false;
        });
    },

    confirmComplete() {
      if (confirm("Êtes-vous sûr de vouloir terminer le quiz?")) {
        this.complete();
        // Au lieu d'appeler openModal, définissez la visibilité du modal sur true
        this.showResultsModal = true;
      }
    },
  },
};
</script>
