import OnbApplicant from '../../onbApplicant/index.vue'

export default {
  name: 'OnbPerson',

  components: {
    OnbApplicant
  },

  data() {
    return {
      apiPaths: {},
      attrLists: {}
    }
  },

  computed: {
    computedAttrLists() {
      return this.$refs.applicantRef?.attrLists || this.attrLists
    }
  }
}
