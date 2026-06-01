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
					this.setAttackCount(1);
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