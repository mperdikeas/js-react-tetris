'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';



const Messages = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        messages: React.PropTypes.array.isRequired
    },    

    render: function() {
        let containerStyle = {
            width : this.props.width,
            height: this.props.height,
            padding: 0,
            color: 'yellow',
            fontSize: `${(this.props.height/10)*0.7}px`,
            paddingLeft:`${this.props.height/10*0.1}px`
        };
        let scoreStyle = (score) => {
            const base = {
                paddingLeft: `${this.props.height/20}px`,
                fontWeight: 'bold',
                fontSize: '105%',
                display: 'inline-block'
            };
            let color = null;
            if (score >= 0)
                color = {color: '#6fff0f'};
            else
                color = {color: 'red'};
            return Object.assign({}, base, color);
        };
        let msgStyle = {
            paddingLeft: `${this.props.height/20}px`,
            fontSize: '90%',
            display: 'inline-block'            
        };
        const messageDivs = this.props.messages.map( (x)=>{
            return (
                <div>
                    <span style={scoreStyle(x.score)}>
                        {(x.score>0?'+':'')+x.score}
                    </span>
                    <br/>
                    <span style={msgStyle}>{x.msg}</span>
                </div>
            );
        } );
        return (
            <div style={containerStyle}>
                {messageDivs}
            </div>                
        );
    }
});

export default Messages;
