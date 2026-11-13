import OnbApplicant from '../../onbApplicant/index.vue'
import {ArrowDown, Search, Refresh, Plus, Download, Delete} from '@element-plus/icons-vue'

export default {
  name: 'OnbPerson2',

  components: {
    OnbApplicant,
    ArrowDown,
    Search,
    Refresh,
    Plus,
    Download,
    Delete
  },

  methods: {
    fun_batchDelete() {
      return this.$refs.applicantRef?.fun_batchDelete?.()
    },

    fun_export() {
      return this.$refs.applicantRef?.fun_export?.()
    },

    fun_recycleBin() {
      return this.$refs.applicantRef?.fun_recycleBin?.()
    }
  }
}
