//spheromancer should only have a 2 combo not 3
ig.ENTITY.Player.inject({
    attackCounterLoop: -1,
    maxAttackCount: 3,
	counterHere: 0,
	setAttackCount(num) {
        this.maxAttackCount = num;
    },
    update: function() {
        const willReset = this.attackResetTimer > 0 && (this.attackResetTimer - ig.system.tick) <= 0;
        if (willReset) {
            this.attackCounterLoop = -1;
        }
        this.parent();
    },
    handleStateStart: function(a, b) {
        this.parent(a, b);
        if (a.startState === 3) {
            if (this.attackResetTimer === 0) {
				
				if (sc.model.player.config.clazz == "SPHEROMANCER") {
					this.setAttackCount(2);
				}
				
				this.counterHere += 1;
				if (this.attackCounter === 2) {
					this.attackCounter -= 2;
				}
				if (this.counterHere === this.maxAttackCount) {
					this.attackCounter = 100;
					this.counterHere = -1;
				}
            }
        }
    }
});
ig.ACTION_STEP.DO_ACTION = ig.ActionStepBase.extend({
    entity/*: ig.Event.GetEntity*/: 0,
    action/*: ig.Action*/: null,
    wait/*: boolean*/: false,
    keepState/*: boolean*/: false,
    _actionEntity/*: unknown*/: null,
    _wm/*: ig.Config*/: new ig.Config({
        attributes: {
            entity: {
                _type: 'Entity',
                _info: 'Entity to move',
                _visualize: true,
                _context: 'Entity',
            },
            action: {
                _type: 'Action',
                _info: 'The action to perform',
                _rec_visualize: ig.ACTION_STEP,
            },
            repeating: {
                _type: 'Boolean',
                _info: 'Repeat Action',
            },
            wait: {
                _type: 'Boolean',
                _info: 'Wait until action is finished',
            },
            keepState: {
                _type: 'Boolean',
                _info: "Don't reset entity state after action",
            },
            immediately: {
                _type: 'Boolean',
                _info: 'If true: execute action immediately not interrupting currently running action. Will only execute steps without wait duration.',
            },
        },
        width: 500,
    }),
    init(settings/*: ig.EVENT_STEP.DO_ACTION.Settings*/)/*: DO_ACTION*/ {
        assertContent(settings, 'entity', 'action')
        this.entity = settings.entity
        this.action = new ig.Action('[GENERIC]', settings.action, false, settings.repeating)
        this.action.eventAction = true
        this.wait = settings.wait || false
        this.keepState = settings.keepState || false
        this.immediately = settings.immediately || false
    },
    clearCached()/*: void*/ {
        this.action && this.action.clearCached()
    },
    start(data/*?: unknown*/, eventCall/*?: ig.EventCall*/)/*: void*/ {
        const c = ig.Event.getEntity(this.entity, eventCall)
        data._actionEntity = c
        if (this.immediately) {
            c.stashAction(true)
            c.setAction(this.action)
            c.forceExecuteAction()
            c.resumeStashedAction(true)
        } else c && c.setAction(this.action, this.keepState)
    },
    run(data/*?: unknown*/)/*: boolean*/ {
        return this.immediately || !data._actionEntity || !this.wait
            ? true
            : data._actionEntity.currentAction == this.action || (data._actionEntity.respawn && data._actionEntity.respawn.timer)
              ? false
              : true
    },
})
ig.EVENT_STEP.WAIT_UNTIL_ON_GROUND = ig.EventStepBase.extend({
    _wm/*: ig.Config*/: new ig.Config({
        attributes: {
            entity: {
                _type: 'Entity',
                _info: 'Entity to move',
                _visualize: true,
                _context: 'Entity',
            },
        },
    }),
    init(settings/*: ig.EVENT_STEP.WAIT_UNTIL_ON_GROUND.Settings*/)/*: WAIT_UNTIL_ON_GROUND*/ {
        this.entity = settings.entity
    },
    start(data/*?: unknown*/, eventCall/*?: ig.EventCall*/)/*: void*/ {
        const c = ig.Event.getEntity(this.entity, eventCall)
        if (c) data._actionEntity = c
    },
    run(data/*?: unknown*/)/*: boolean*/ {
        if (!data._actionEntity) return true
        data = data._actionEntity
        return data.coll.vel.z >= 0 && !data.coll.zGravityFactor ? true : data.coll.pos.z == data.coll.baseZPos
    },
})