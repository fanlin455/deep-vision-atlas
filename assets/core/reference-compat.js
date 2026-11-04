/* 原课程演示作为兼容资源，供旧格式的demo.builtin引用，不占前台案例入口。 */
(function(){'use strict';
 const refs=Object.create(null),registry=window.Cases,get=registry.get;
 registry.list().forEach(c=>{refs[c.id]=c;registry.unregister(c.id);});
 registry.get=function(id){return get.call(registry,id)||refs[id]||null;};
 window.COURSE_REFERENCE_CASES=refs;
})();
