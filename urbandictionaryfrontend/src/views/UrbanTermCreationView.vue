<template>
  <div class=" mask py-lg-5" style="background-color: rgba(0, 0, 0, 0.8);">
    <!-- Urban Term and Defintion creation-->
    <h1 class="fw-light text-white">Create your Urban Term</h1>
    <b-form-group :invalid-feedback="violation.familyName" :state="hasErr.UrbanTerm" class="mb-1" >
      <b-input-group>
        <b-form-input :placeholder="dt.UrbanTerm"
                      :state="hasErr.UrbanTerm" :disabled="isDisabled"
                      v-model="tempUrbanTerm.urbanterm"
                      trim @keydown="violation.familyName=null" />
      </b-input-group>
    </b-form-group>
    <b-form-group :invalid-feedback="violation.UrbanTerm" :state="hasErr.UrbanTerm" class="mb-1" >
      <b-input-group>
        <b-form-textarea :placeholder="dt.Definition" :state="hasErr.Definition"
                         :disabled="isDisabled" v-model="tempDefinition.definition"
                         trim @keydown="violation.familyName=null" />
      </b-input-group>
    </b-form-group>

    <!-- BUTTONS -->
    <b-button-group class="w-100 mb-3">

      <!--      Create button will call the post method for both urban term and definition-->
      <b-button variant="primary" :disabled="isDisabled" @click="saveThis">
        <b-icon-cloud-arrow-up-fill ref="iconSave" /> Create</b-button>

      <router-link :to="`/`" >
        <b-button variant="primary" :disabled="isDisabled" @click="cancel">
          <b-icon-x-square-fill /> Cancel</b-button>
      </router-link>
    </b-button-group>

    <!--    &lt;!&ndash; ERROR MESSAGE &ndash;&gt;-->
    <!--    <b-alert variant="danger" :show="violation.violationMessage">-->
    <!--      {{violation.violationMessage}}-->
    <!--    </b-alert>-->

  </div>
</template>

<script lang="ts">
import {
  Component, Mixins, Prop, Watch,
} from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';
import UrbanTerm from '@/models/UrbanTerm';
import { BIcon } from 'bootstrap-vue';
import UrbanTermDefinition from '@/models/UrbanTermDefinition';
import IconButton from '@/components/IconButton.vue';

@Component({
  components: {
    IconButton, BIcon,
  },
})
export default class UrbanTermCreationView extends Mixins(GlobalMixin) {
  @Prop({ type: Object, validator: (s) => s instanceof Object }) readonly UrbanTerm: any

  @Prop({ type: Object, validator: (s) => s instanceof Object }) readonly UrbanTermDefinition: any

  @Prop()
  trendingUrbanTerms = null;

  tempUrbanTerm: UrbanTerm = new UrbanTerm()

  tempDefinition: UrbanTermDefinition = new UrbanTermDefinition()

  // Validation
  violation: any = {}

  dt = {
    UrbanTerm: 'UrbanTerm',
    Definition: 'Definition',
  }

  get hasErr(): any {
    return {
      UrbanTerm: this.violation.UrbanTerm ? false : null,
      Definition: this.violation.Definition ? false : null,
    };
  }

  get isNew(): boolean {
    // if studentID is null, 0 , '' then it's a new student not an existing student
    return !this.UrbanTerm || !this.UrbanTerm.id;
  }

  cancel() {
    this.tempUrbanTerm = new UrbanTerm();
    this.tempDefinition = new UrbanTermDefinition();
  }

  // This method will save the urban term into the database and
  // than save the definition for the data base
  async saveThis() {
    await this.saveUrbanTerm();
    await this.saveDefinition();
  }

  async saveUrbanTerm() {
    this.violation = await this.getErrorMessages(this.tempUrbanTerm);

    if (Object.keys(this.violation).length === 0) {
      this.setBusy(true);// tell parent that this component is waiting for the api to respond

      const url = this.URBAN_TERM_API + (this.isNew ? '' : `/${this.tempUrbanTerm.id}`);
      const method = this.isNew ? 'post' : 'put';

      try {
        // eslint-disable-next-line max-len
        const data = await this.callAPI(url, method, this.tempUrbanTerm); // returns a promise object
        // emit the action that occurred along with the data received from the api server
        // to be used by the parent to update the b-table of students
        this.$emit(this.tempUrbanTerm.id === data.id ? 'updated' : 'added', data);
      } catch (err:any) {
        // get the violation messages from the api - if the web server responded
        this.violation = this.mapValidationErrorArray(err.data);
      } finally {
        this.setBusy(false);// tell parent that this component is no longer waiting for the api
      }
    }
  }

  async saveDefinition() {
    const terms = await this.callAPI(this.TermApi());
    console.log('hello');
    console.log(terms);
    const definiton = this.tempDefinition;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < terms.length; i++) {
      console.log(terms[i].urbanterm);
      console.log(this.tempUrbanTerm.urbanterm);
      console.log(terms[i].urbanterm === this.tempUrbanTerm.urbanterm);
      if (terms[i].urbanterm === this.tempUrbanTerm.urbanterm) {
        definiton.urbanterm = terms[i].id;
      }
    }
    if (definiton.urbanterm === undefined) {
      definiton.urbanterm = terms[terms.length - 1].id + 1;
    }
    definiton.user = 1;
    definiton.term = this.tempUrbanTerm.urbanterm;
    definiton.displayname = 'HaXSaW';
    this.violation = await this.getErrorMessages(definiton);
    console.log(this.violation);
    if (Object.keys(this.violation).length === 0) {
      this.setBusy(true);// tell parent that this component is waiting for the api to respond
      const url = this.DefinitionApi();
      const method = 'post';

      try {
        // eslint-disable-next-line max-len
        const data = await this.callAPI(url, method, this.tempDefinition); // returns a promise object
        // emit the action that occurred along with the data received from the api server
        // to be used by the parent to update the b-table of students
        this.$emit(this.tempDefinition.id === data.id ? 'updated' : 'added', data);
        this.cancel();
      } catch (err:any) {
        // get the violation messages from the api - if the web server responded
        this.violation = this.mapValidationErrorArray(err.data);
      } finally {
        this.setBusy(false);// tell parent that this component is no longer waiting for the api
      }
    }
  }
}

</script>
