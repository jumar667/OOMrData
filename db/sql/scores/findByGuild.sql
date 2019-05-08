/**
 * @Author: BanderDragon
 * @Date:   2019-05-06T08:09:56+01:00
 * @Email:  noscere1978@gmail.com
 * @Project: MrData
 * @Filename: findByGuild.sql
 * @Last modified by:   BanderDragon
 * @Last modified time: 2019-05-06T20:54:07+01:00
 */

SELECT
	users.user_id, users.id, guilds.guild_id, guilds.id,
	scores.power_destroyed,
	scores.resources_raided,
	scores.total_power,
	scores.pvp_ships_destroyed,
	scores.pvp_kd_ratio,
	scores.pvp_total_damage,
	scores.hostiles_destroyed,
	scores.hostiles_total_damage,
	scores.resources_mined,
	scores.current_level
FROM
	scores
JOIN users ON users.id = scores.user_id
JOIN guilds ON guilds.id = scores.guild_id
WHERE guilds.guild_id = ${guildId}
ORDER BY ${orderBy:raw}
;
