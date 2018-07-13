import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';

Template.reportSidebar.onRendered(() => {
	
});

Template.reportSidebar.onCreated(() => {
	const instance = Template.instance();
	instance.data.isCompleteReport = new ReactiveVar(false);
});

Template.reportSidebar.helpers({	
	reportData() {
		const instance = Template.instance();
		const data = {};
		if(instance.data.isCompleteReport.get()){
			data = {
				imageWatch: [{
					id: 1,
					text: '两肺轻度淤血，双肺门阴影增大、模糊，心脏增大呈“二尖瓣-普大型”/“三尖瓣-普大型”/“主动脉型”/“梨形”/“烧瓶状”/“靴形”,心胸比例为（）。余未见明显异常。'
				},{
					id: 2,
					text: '左/右膝关节胫骨平台增白变硬'
				},{
					id: 3,
					text: '左/右膝关节胫骨平台增白变硬， 膝关节构成骨部分骨端可见骨质增生影，内侧关节间隙稍变窄，周围软组织未见明显异常。'
				}],
				diagnosticAdvice: [{
					id: 1,
					text: '双肺纹理无明显增多、增粗，肺内未见明显实变影，两肺门影无增大及增浓；纵隔居中，心影大小、形态、位置可；双侧膈面清晰，肋膈角锐利。'
				},{
					id: 2,
					text: '心、肺、膈未见明显异常。'
				},{
					id: 3,
					text: '左/右膝关节退行性变。'
				}]
			}
		}else{
			data = {
				imageWatch: [{
					id: 1,
					text: '两肺轻度淤血，双肺门阴影增大、模糊，心脏增大呈“二尖瓣-普大型”/“三尖瓣-普大型”/“主动脉型”/“梨形”/“烧瓶状”/“靴形”,心胸比例为（）。余未见明显异常。'
				},{
					id: 2,
					text: '左/右膝关节胫骨平台增白变硬'
				}],
				diagnosticAdvice: [{
					id: 1,
					text: '双肺纹理无明显增多、增粗，肺内未见明显实变影，两肺门影无增大及增浓；纵隔居中，心影大小、形态、位置可；双侧膈面清晰，肋膈角锐利。'
				},{
					id: 2,
					text: '心、肺、膈未见明显异常。'
				}]
			}
		}

		return data;
		
	}
});

Template.reportSidebar.events({
	'click .report-header div'(event, instance){
		const $thisTarget = $(event.currentTarget);
		if($thisTarget.index() == 0){
			instance.data.isCompleteReport.set(false)
		}else{
			instance.data.isCompleteReport.set(true)
		}
	}
});