<template>
   <ul class="item">
        <li :class="{'bold': isFolder, 'has-errors': item.isError}"
            class="item-container">
            <input type="checkbox"
                v-show="isCheckboxVisible" 
                v-model="item.isChecked">
            <label @click="onClick" class="pointer">
                <i :class="{rotated: item.isOpen}"
                    class="fa fa-chevron-right"
                    v-if="isFolder">
                </i>
                <i class="label blabla">{{ item.name }}</i>
            </label>
        </li>

        <li v-if="isFolder" v-show="item.isOpen">
            <tree-item v-for="(child, index) in item.children"
                :key="index"
                :item="child"
                :isSelectable="isSelectable"
                :isCheckboxVisible="isSelectable"
                @item-click="$emit('item-click', child)">
            </tree-item>
        </li>
  </ul>
</template>

<script>

export default {
    name: 'tree-item',
    props: {
        item: Object,
        isSelectable: Boolean,
        isCheckboxVisible: Boolean
    },
    data() {
        return {};
    },
    computed: {
        isFolder() {
            const item = this.item;
            return (item.children && item.children.length>0);
        },

        isChecked() {
            return this.item && this.item.isChecked;
        }
    },
    methods: {
        onClick() {
            if (!this.isFolder) {
                this.$emit('item-click', this.item);
                return;
            }
                
            this.item.isOpen = !this.item.isOpen;

            this.$forceUpdate();
        },
    },

    mounted() {
        if(!this.item.isOpen) this.item.isOpen = false;
    }
 }

</script>